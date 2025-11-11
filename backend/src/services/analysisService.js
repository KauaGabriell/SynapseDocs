import { simpleGit } from 'simple-git';
import path from 'path'; // Ferramenta do Node.js para lidar com caminhos
import { fileURLToPath } from 'url';

// Configuração básica do simple-git
const git = simpleGit();

// Descobre o caminho absoluto para a nossa pasta 'tmp'
// (__dirname não existe no ESM, então usamos este método)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Sobe dois níveis (de /src/services para /backend) e entra em /tmp
const tmpPath = path.join(__dirname, '../../tmp'); 

const analysisService = {};

/**
 * Inicia o processo de análise de um repositório.
 * @param {object} project - O objeto do projeto do nosso banco de dados (da tabela 'projects')
 */
analysisService.analyzeRepository = async (project) => {
  console.log(`[Análise] Iniciando: ${project.name} (${project.id_projects})`);
  
  // Define um nome de pasta único para este projeto
  const repoFolder = path.join(tmpPath, project.id_projects.toString());

  try {
    // 1. Atualizar o status no banco para "processing"
    await project.update({ status: 'processing', progress: 10 });
    console.log(`[Análise] Status: processing`);

    // 2. Clonar o repositório
    console.log(`[Análise] Clonando ${project.repositoryUrl} para ${repoFolder}`);
    await git.clone(project.repositoryUrl, repoFolder);
    console.log('[Análise] Repositório clonado.');
    await project.update({ progress: 30 });


    // 5. Mudar o status para 'completed' (Simulação por enquanto)
    await project.update({ status: 'completed', progress: 100, language: 'JavaScript' });
    console.log('[Análise] Status: completed');

  } catch (err) {
    console.error(`[Análise] Falha: ${err.message}`);
    // Mudar o status para 'failed'
    try {
      await project.update({ status: 'failed', progress: 0 });
    } catch (dbError) {
      console.error('Erro ao atualizar status para "failed":', dbError);
    }
  }
};


export default analysisService;