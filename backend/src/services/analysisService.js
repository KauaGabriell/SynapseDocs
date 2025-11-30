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

// ✅ CORREÇÃO: Modelo correto do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.2,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

// --- Função Auxiliar: Detectar Framework ---
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
    } catch (e) {
      console.warn('Erro ao parsear package.json');
    }
  }
  
  if (requirementsFile) {
    if (requirementsFile.content.includes('fastapi')) {
      return { framework: 'FastAPI', language: 'Python' };
    }
    if (requirementsFile.content.includes('flask')) {
      return { framework: 'Flask', language: 'Python' };
    }
  }
  
  return { framework: 'Desconhecido', language: 'JavaScript' };
}

// --- Função Auxiliar: Ler Arquivos com Priorização ---
async function getProjectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  
  // Pastas a ignorar
  const ignoredDirs = [
    'node_modules', '.git', 'dist', 'build', 'coverage', 
    '.idea', '.vscode', '__pycache__', 'venv', '.env'
  ];
  
  // Extensões prioritárias (rotas e configurações)
  const priorityExtensions = [
    '.route.js', '.routes.js', 'router.js', 'routes.js',
    '.controller.js', '.api.js', 'main.py', 'app.py'
  ];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (ignoredDirs.includes(entry.name)) continue;
      files.push(...(await getProjectFiles(fullPath)));
    } else {
      // Filtrar arquivos relevantes
      const validExtensions = /\.(js|ts|jsx|tsx|json|py)$/;
      const isLockFile = entry.name.includes('lock');
      const isConfigOnly = /^(\.env|\.gitignore|\.eslintrc)/.test(entry.name);
      
      if (!validExtensions.test(entry.name) || isLockFile || isConfigOnly) {
        continue;
      }
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Limite de 100KB por arquivo
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
      } catch (e) {
        console.warn(`⚠️  Erro ao ler ${entry.name}: ${e.message}`);
      }
    }
  }
  
  // Ordenar por prioridade (arquivos de rota primeiro)
  return files.sort((a, b) => a.priority - b.priority);
}

// --- Função Principal: Analisar Repositório ---
const analysisService = {};

analysisService.analyzeRepository = async (project) => {
  console.log(`\n🔍 [Análise] Iniciando: ${project.name}`);
  const repoFolder = path.join(tmpPath, project.id_projects.toString());

  try {
    // 1. Status: Clonando
    await project.update({ 
      status: 'processing', 
      progress: 10, 
      description: '📦 Clonando repositório...' 
    });

    // Limpeza e Clone
    try { 
      await fs.rm(repoFolder, { recursive: true, force: true }); 
    } catch (e) {}
    
    await git.clone(project.repositoryUrl, repoFolder);
    console.log('✅ Repositório clonado com sucesso');

    // 2. Status: Lendo arquivos
    await project.update({ 
      progress: 30, 
      description: '📂 Analisando estrutura do projeto...' 
    });

    const files = await getProjectFiles(repoFolder);
    console.log(`📊 ${files.length} arquivos encontrados`);

    if (files.length === 0) {
      throw new Error("❌ Nenhum arquivo de código encontrado no repositório");
    }

    // 3. Detectar framework
    const { framework, language } = detectFramework(files);
    console.log(`🔧 Framework detectado: ${framework} (${language})`);

    await project.update({ 
      progress: 50, 
      description: `🤖 Gerando documentação com IA (${framework})...`,
      language: language
    });

    // 4. Construir Prompt Otimizado
    const prompt = buildOptimizedPrompt(project.name, framework, language, files);

    // 5. Chamar Gemini com retry
    console.log('🚀 Enviando para Gemini...');
    let attempt = 0;
    let result;
    
    while (attempt < 3) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error) {
        attempt++;
        if (attempt === 3) throw error;
        console.log(`⚠️  Tentativa ${attempt} falhou, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s
      }
    }

    const response = await result.response;
    let text = response.text();

    // 6. Limpar e validar JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let jsonContent;
    try {
      jsonContent = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      throw new Error('A IA não retornou um JSON válido. Tente novamente.');
    }

    // 7. Validar estrutura OpenAPI básica
    if (!jsonContent.openapi && !jsonContent.swagger) {
      console.warn('⚠️  Resposta não está no formato OpenAPI, ajustando...');
      jsonContent = {
        openapi: "3.0.0",
        info: {
          title: project.name,
          version: "1.0.0",
          description: "Documentação gerada automaticamente"
        },
        paths: jsonContent.paths || jsonContent,
        components: jsonContent.components || {}
      };
    }

    console.log('✅ Documentação gerada com sucesso');

    // 8. Salvar no Banco de Dados
    await project.update({ 
      progress: 90, 
      description: '💾 Salvando documentação...' 
    });

    await db.ApiDocumentation.create({
      content: jsonContent,
      version: '1.0.0',
      id_project: project.id_projects
    });

    // 9. Finalizar com sucesso
    await project.update({ 
      status: 'completed', 
      progress: 100,
      language: language,
      description: jsonContent.info?.description || 'Documentação OpenAPI gerada automaticamente'
    });

    console.log('🎉 Análise concluída com sucesso!\n');

    // Limpeza do diretório temporário
    try {
      await fs.rm(repoFolder, { recursive: true, force: true });
    } catch (e) {}

  } catch (err) {
    console.error(`\n❌ [Análise] Erro:`, err);
    
    try {
      await project.update({ 
        status: 'failed', 
        progress: 0,
        description: `❌ Falha: ${err.message.slice(0, 200)}`
      });
    } catch (dbError) {
      console.error('💥 Erro crítico ao atualizar status:', dbError);
    }
  }
};

// --- Função Auxiliar: Construir Prompt Otimizado ---
function buildOptimizedPrompt(projectName, framework, language, files) {
  // Limitar a 30 arquivos mais relevantes
  const relevantFiles = files.slice(0, 30);
  
  let filesContent = '';
  relevantFiles.forEach(file => {
    filesContent += `\n\n--- ARQUIVO: ${file.relativePath} ---\n${file.content}`;
  });

  return `Você é um Engenheiro de Software Sênior especializado em documentação de APIs.

**TAREFA:** Analise o código-fonte abaixo e gere uma especificação OpenAPI 3.0 COMPLETA e VÁLIDA em formato JSON.

**INFORMAÇÕES DO PROJETO:**
- Nome: ${projectName}
- Framework: ${framework}
- Linguagem: ${language}

**INSTRUÇÕES CRÍTICAS:**
1. Identifique TODOS os endpoints (rotas HTTP) no código
2. Para cada endpoint, extraia:
   - Método HTTP (GET, POST, PUT, DELETE, PATCH)
   - Caminho da rota (path)
   - Parâmetros de rota (path parameters)
   - Query parameters
   - Request body (com schema detalhado)
   - Responses (status codes e schemas)
   - Descrição clara do que o endpoint faz

3. Identifique e documente todos os schemas/modelos de dados
4. Use a estrutura OpenAPI 3.0 PADRÃO
5. Seja DETALHADO nas descrições
6. Inclua exemplos quando possível

**FORMATO DE SAÍDA:**
- Retorne APENAS o JSON válido
- NÃO inclua markdown, backticks ou explicações
- O JSON deve começar com { e terminar com }

**ESTRUTURA ESPERADA:**
{
  "openapi": "3.0.0",
  "info": {
    "title": "${projectName}",
    "version": "1.0.0",
    "description": "Descrição da API"
  },
  "paths": {
    "/rota": {
      "get": {
        "summary": "...",
        "parameters": [...],
        "responses": {...}
      }
    }
  },
  "components": {
    "schemas": {...}
  }
}

**CÓDIGO-FONTE DO PROJETO:**
${filesContent}

**LEMBRE-SE:** Retorne APENAS JSON válido, sem formatação markdown.`;
}

export default analysisService;