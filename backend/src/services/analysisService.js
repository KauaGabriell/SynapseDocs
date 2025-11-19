import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Importa o Gemini
import db from '../models/index.js'; // Importa o Banco

// Configurações
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpPath = path.join(__dirname, '../../tmp');
const git = simpleGit();

// Inicializa o Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function getProjectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        [
          'node_modules',
          '.git',
          'dist',
          'build',
          'coverage',
          '.idea',
          '.vscode',
          '__pycache__',
        ].includes(entry.name)
      )
        continue;
      files.push(...(await getProjectFiles(fullPath)));
    } else {
      if (/\.(js|ts|jsx|tsx|json|py|java|cs|php|go|rb|rs)$/.test(entry.name)) {
        if (entry.name.includes('lock')) continue;
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          if (content.length < 100000) {
            files.push({
              path: fullPath,
              name: entry.name,
              content: content,
            });
          }
        } catch (e) {}
      }
    }
  }
  return files;
}

const analysisService = {};

analysisService.analyzeRepository = async (project) => {
  console.log(`[Análise] Iniciando: ${project.name}`);
  const repoFolder = path.join(tmpPath, project.id_projects.toString());

  try {
    await project.update({
      status: 'processing',
      progress: 10,
      description: 'Clonando...',
    });

    // 1. Limpeza e Clone
    try {
      await fs.rm(repoFolder, { recursive: true, force: true });
    } catch (e) {}
    await git.clone(project.repositoryUrl, repoFolder);
    await project.update({ progress: 30, description: 'Lendo arquivos...' });

    // 2. Leitura dos Arquivos
    const files = await getProjectFiles(repoFolder);
    console.log(`[Análise] ${files.length} arquivos lidos.`);

    if (files.length === 0)
      throw new Error('Nenhum arquivo de código encontrado.');

    await project.update({
      progress: 50,
      description: 'Gerando documentação com IA...',
    });

    // 3. Montar o Prompt para a IA
    let prompt = `
      Você é um Engenheiro de Software Sênior especialista em documentação de API.
      Analise o código-fonte abaixo e gere uma especificação OpenAPI 3.0 completa em formato JSON.
      
      Regras:
      1. Identifique todas as rotas (endpoints), métodos HTTP, parâmetros e corpos de requisição.
      2. Identifique os modelos de dados (schemas).
      3. O título da API deve ser "${project.name}".
      4. Responda APENAS com o JSON válido. Sem markdown, sem explicações.

      Código do Projeto:
    `;

    files.forEach((file) => {
      prompt += `\n--- ARQUIVO: ${file.name} ---\n${file.content}\n`;
    });

    // 4. Chamar o Gemini
    console.log('[Análise] Enviando para o Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpeza do texto da IA
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    console.log('[Análise] Resposta recebida. Salvando...');

    // 5. Salvar no Banco de Dados
    const jsonContent = JSON.parse(text);

    // Cria ou Atualiza a documentação
    // (Usamos create porque a relação é 1-1 e o projeto é novo)
    const doc = await db.ApiDocumentation.create({
      content: jsonContent,
      version: '1.0.0',
    });

    await project.setApiDocumentation(doc);

    // 6. Finalizar
    await project.update({
      status: 'completed',
      progress: 100,
      language: files.some((f) => f.name.endsWith('.py'))
        ? 'Python'
        : 'JavaScript',
      description:
        jsonContent.info?.description || 'Documentação gerada automaticamente.',
    });

    console.log('[Análise] Sucesso Total!');
  } catch (err) {
    console.error(`[Análise] Erro:`, err);
    await project.update({
      status: 'failed',
      progress: 0,
      description: `Falha: ${err.message.slice(0, 200)}`,
    });
  }
};

export default analysisService;
