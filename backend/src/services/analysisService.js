import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises'; // Para manipulação de arquivos
import { fileURLToPath } from 'url';

// 1. Configuração de Caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define onde os repositórios serão salvos: backend/tmp/
const tmpPath = path.join(__dirname, '../../tmp');

const git = simpleGit();
const analysisService = {};

/**
 * Função Auxiliar: Lê arquivos recursivamente de uma pasta.
 * Ignora pastas inúteis (node_modules, etc) e arquivos binários.
 */
async function getProjectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // 1. Se for diretório, decide se entra ou ignora
    if (entry.isDirectory()) {
      // Lista negra de pastas para ignorar
      if (
        [
          'node_modules',
          '.git',
          'dist',
          'build',
          'coverage',
          '.idea',
          '.vscode',
        ].includes(entry.name)
      ) {
        continue;
      }
      // Recursão: entra na subpasta e adiciona o que encontrar
      files.push(...(await getProjectFiles(fullPath)));
    }
    // 2. Se for arquivo, decide se lê
    else {
      // Filtra apenas extensões de código relevantes para nossa análise
      if (/\.(js|ts|jsx|tsx|json|py|java|cs|php|go|rb|rs)$/.test(entry.name)) {
        // Ignora arquivos de lock grandes (package-lock.json, etc)
        if (entry.name.includes('lock')) continue;

        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          // Adiciona ao array: Caminho e Conteúdo
          files.push({
            path: fullPath,
            // Armazena o nome relativo para facilitar a leitura (ex: src/server.js)
            name: entry.name,
            content: content,
          });
        } catch (readError) {
          console.warn(
            `Não foi possível ler o arquivo ${entry.name}: ${readError.message}`,
          );
        }
      }
    }
  }
  return files;
}

/**
 * Função Principal: Gerencia o ciclo de vida da análise
 * @param {object} project - O modelo do Sequelize (contém id, url, etc.)
 */
analysisService.analyzeRepository = async (project) => {
  console.log(`[Análise] Iniciando: ${project.name} (${project.id_projects})`);

  const repoFolder = path.join(tmpPath, project.id_projects.toString());

  try {
    // --- PASSO 1: Atualizar Status Inicial ---
    await project.update({
      status: 'processing',
      progress: 10,
      description: 'Preparando ambiente...',
    });

    // --- PASSO 2: Limpeza de Segurança ---
    try {
      await fs.rm(repoFolder, { recursive: true, force: true });
      console.log(`[Análise] Pasta limpa: ${repoFolder}`);
    } catch (e) {
      // Ignora se a pasta não existir
    }

    // --- PASSO 3: Clonagem ---
    console.log(`[Análise] Clonando ${project.repositoryUrl}...`);
    await project.update({ description: 'Baixando código-fonte...' });

    await git.clone(project.repositoryUrl, repoFolder);
    console.log('[Análise] Repositório clonado.');

    await project.update({
      progress: 30,
      description: 'Lendo arquivos do projeto...',
    });

    // --- PASSO 4: Leitura de Arquivos ---
    console.log(`[Análise] Lendo arquivos de: ${repoFolder}`);
    const files = await getProjectFiles(repoFolder);

    console.log(`[Análise] ${files.length} arquivos de código encontrados.`);

    // Log para verificarmos no terminal se ele achou os arquivos certos
    if (files.length > 0) {
      console.log('Arquivos encontrados (amostra):');
      files.slice(0, 5).forEach((f) => console.log(` - ${f.name}`)); // Mostra os 5 primeiros
    } else {
      console.warn('[Análise] Nenhum arquivo de código relevante encontrado!');
    }

    await project.update({
      progress: 50,
      description: 'Processando código com IA...',
    });

    // --- PASSO 5: Chamar a IA (Gemini) ---
    // (Esta parte implementaremos no próximo Item do Checklist)
    // Por enquanto, simulamos o sucesso.

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulação

    // --- PASSO 6: Finalização ---
    await project.update({
      status: 'completed',
      progress: 100,
      // Tenta adivinhar a linguagem baseada nos arquivos (lógica simples)
      language: files.some((f) => f.name.endsWith('.py'))
        ? 'Python'
        : 'JavaScript/TypeScript',
      description: `Análise concluída. ${files.length} arquivos processados.`,
    });

    console.log('[Análise] Finalizado com sucesso.');
  } catch (err) {
    console.error(`[Análise] Falha: ${err.message}`);

    try {
      await project.update({
        status: 'failed',
        progress: 0,
        description: `Erro: ${err.message}`,
      });
    } catch (dbError) {
      console.error('Erro ao atualizar status no banco:', dbError);
    }
  }
};

export default analysisService;
