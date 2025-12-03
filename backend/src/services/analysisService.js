import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../models/index.js';

// --- Configurações ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpPath = path.join(__dirname, '../../tmp');
const git = simpleGit();

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
    maxOutputTokens: 8192,
  }
});

// --- Funções Auxiliares de Arquivo e Framework ---
function detectFramework(files) {
  const packageJsonFile = files.find(f => f.name === 'package.json');
  const requirementsFile = files.find(f => f.name === 'requirements.txt');
  
  if (packageJsonFile) {
    try {
      const pkg = JSON.parse(packageJsonFile.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.express) return { framework: 'Express', language: 'JavaScript' };
      if (deps.fastify) return { framework: 'Fastify', language: 'JavaScript' };
      if (deps['@nestjs/core']) return { framework: 'NestJS', language: 'TypeScript' };
    } catch (e) {}
  }
  return { framework: 'Desconhecido', language: 'JavaScript' };
}

async function getProjectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  const ignoredDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.idea', '.vscode', '__pycache__', 'venv', '.env'];
  const priorityExtensions = ['.route.js', '.routes.js', 'router.js', 'routes.js', '.controller.js', '.api.js', 'main.py', 'app.py'];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.includes(entry.name)) continue;
      files.push(...(await getProjectFiles(fullPath)));
    } else {
      const validExtensions = /\.(js|ts|jsx|tsx|json|py)$/;
      const isLockFile = entry.name.includes('lock');
      if (!validExtensions.test(entry.name) || isLockFile) continue;
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        if (content.length < 100000) {
          const isPriority = priorityExtensions.some(ext => entry.name.includes(ext));
          files.push({
            path: fullPath,
            name: entry.name,
            content: content,
            priority: isPriority ? 1 : 2,
            relativePath: fullPath.replace(dir, '').replace(/\\/g, '/')
          });
        }
      } catch (e) {}
    }
  }
  return files.sort((a, b) => a.priority - b.priority);
}

// --- LÓGICA DE BATCH E MERGE ---

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function mergeOpenApiSpecs(specs, projectName) {
  const finalSpec = {
    openapi: "3.0.0",
    info: {
      title: projectName,
      version: "1.0.0",
      description: "Documentação gerada automaticamente via SynapseDocs"
    },
    paths: {},
    components: { schemas: {} }
  };

  specs.forEach(spec => {
    if (!spec) return;
    if (spec.paths) Object.assign(finalSpec.paths, spec.paths);
    if (spec.components && spec.components.schemas) Object.assign(finalSpec.components.schemas, spec.components.schemas);
  });

  return finalSpec;
}

// --- Função Principal ---
const analysisService = {};

analysisService.analyzeRepository = async (project) => {
  console.log(`\n🔍 [Análise] Iniciando: ${project.name}`);
  const repoFolder = path.join(tmpPath, project.id_projects.toString());

  try {
    await project.update({ status: 'processing', progress: 10, description: '📦 Clonando repositório...' });
    
    try { await fs.rm(repoFolder, { recursive: true, force: true }); } catch (e) {}
    await git.clone(project.repositoryUrl, repoFolder);
    
    await project.update({ progress: 20, description: '📂 Lendo arquivos...' });
    const files = await getProjectFiles(repoFolder);
    
    if (files.length === 0) throw new Error("❌ Nenhum arquivo de código encontrado");
    
    const { framework, language } = detectFramework(files);
    
    // Batch: Processar 40 arquivos mais relevantes em lotes de 5
    const relevantFiles = files.slice(0, 40); 
    const batches = chunkArray(relevantFiles, 5); 
    const partialSpecs = [];
    
    console.log(`⚡ Iniciando processamento em ${batches.length} lotes...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const progress = 30 + Math.floor((i / batches.length) * 50);
      
      await project.update({ 
        progress: progress, 
        description: `🤖 Analisando lote ${i + 1}/${batches.length} (${framework})...` 
      });

      // Prompt que força PT-BR
      const prompt = buildBatchPrompt(project.name, framework, language, batch);
      
      let attempt = 0;
      while (attempt < 3) {
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text();
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const jsonPart = JSON.parse(text);
          partialSpecs.push(jsonPart);
          console.log(`✅ Lote ${i + 1} processado com sucesso.`);
          break;
        } catch (error) {
          attempt++;
          console.error(`⚠️ Falha no lote ${i + 1}:`, error.message);
          if (attempt === 3) console.error(`❌ Pulando lote ${i + 1}.`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    await project.update({ progress: 85, description: '🔄 Unificando documentação...' });
    
    const finalJson = mergeOpenApiSpecs(partialSpecs, project.name);
    
    if (Object.keys(finalJson.paths).length === 0) {
       throw new Error("Não foi possível identificar rotas nos arquivos analisados.");
    }

    console.log(`💾 Salvando: ${Object.keys(finalJson.paths).length} rotas encontradas.`);

    await db.ApiDocumentation.create({
      content: finalJson,
      version: '1.0.0',
      id_project: project.id_projects
    });

    await project.update({ 
      status: 'completed', 
      progress: 100, 
      language: language,
      description: `Documentação gerada com ${Object.keys(finalJson.paths).length} endpoints.`
    });

    console.log('🎉 Sucesso total!\n');

  } catch (err) {
    console.error(`❌ Erro Fatal:`, err);
    await project.update({ status: 'failed', progress: 0, description: `Erro: ${err.message.slice(0, 200)}` });
  } finally {
    try { await fs.rm(repoFolder, { recursive: true, force: true }); } catch (e) {}
  }
};

// --- Prompt Ajustado para Português ---
function buildBatchPrompt(projectName, framework, language, files) {
  let filesContent = '';
  files.forEach(file => {
    filesContent += `\nFILE PATH: ${file.relativePath}\nCONTENT:\n${file.content}\n---`;
  });

  return `
Role: Senior API Documenter.
Task: Analyze code files and extract OpenAPI 3.0 definitions.

Project: ${projectName} (${framework} / ${language})

Instructions:
1. Return a JSON object with "paths" and "components".
2. **IMPORTANT: All descriptions, summaries, and explanations MUST be in Portuguese (PT-BR).**
3. Keep parameter names and technical keys in English/Code standard.
4. Output ONLY valid JSON.

Input Files:
${filesContent}

Expected JSON Structure:
{
  "paths": {
    "/rota": {
      "get": {
        "summary": "Descrição em Português aqui",
        "description": "Detalhes em Português...",
        ...
      }
    }
  },
  "components": { ... }
}`;
}

export default analysisService;