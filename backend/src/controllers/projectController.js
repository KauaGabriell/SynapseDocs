import db from '../models/index.js';
import analysisService from '../services/analysisService.js';

const projectController = {};

// Lista todos os projetos do usuário
projectController.getProjects = async function (req, res) {
  try {
    const userId = req.id_user;
    const projects = await db.Project.findAll({
      where: { id_user: userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.ApiDocumentation,
          as: 'documentation',
        },
      ],
    });

    // Mapeia para adicionar um campo documentationUrl (se existir doc)
    const mapped = projects.map((p) => {
      const plain = p.toJSON ? p.toJSON() : p;
      return {
        ...plain,
        documentationUrl: plain.documentation
          ? `${
              process.env.BACKEND_BASE_URL || 'http://localhost:3030'
            }/api/projects/${plain.id_projects}/documentation`
          : null,
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

// Adiciona um novo projeto
projectController.addProjects = async function (req, res) {
  const { name, repositoryUrl } = req.body;
  // Preenche com null se não vier do front
  const description = req.body.description || null;
  const language = req.body.language || null;

  try {
    const userId = req.id_user;

    const newProject = await db.Project.create({
      name,
      repositoryUrl,
      id_user: userId,
      description,
      language,
      status: 'pending',
      progress: 0,
    });

    // Inicia a análise (sem await para não travar a resposta)
    analysisService.analyzeRepository(newProject);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar projeto.' });
  }
};

// Busca detalhes de um projeto específico
projectController.getProjectById = async function (req, res) {
  const { id } = req.params;
  const userId = req.id_user;

  try {
    const project = await db.Project.findOne({
      where: {
        id_projects: id,
        id_user: userId,
      },
      // AQUI ESTÁ O USO:
      include: [
        {
          model: db.ApiDocumentation,
          as: 'documentation', // <--- O apelido TEM que ser igual ao do index.js
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    res.json(project);
  } catch (error) {
    console.error('Erro ao buscar detalhes do projeto:', error);
    res.status(500).json({ error: 'Erro interno ao buscar detalhes.' });
  }
};

// controllers/projectController.js (novo método)
projectController.getDocumentation = async function (req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.id_user;

    // Confere propriedade do projeto (segurança)
    const project = await db.Project.findOne({
      where: { id_projects: projectId, id_user: userId },
    });

    if (!project)
      return res.status(404).json({ error: 'Projeto não encontrado' });

    const doc = await db.ApiDocumentation.findOne({
      where: { id_project: projectId },
    });

    if (!doc)
      return res.status(404).json({ error: 'Documentação não encontrada' });

    // Retorna o JSON de documentação (raw)
    res.json(doc.content);
  } catch (err) {
    console.error('Erro ao buscar documentação:', err);
    res.status(500).json({ error: 'Erro ao buscar documentação' });
  }
};

projectController.deleteProject = async function (req, res) {
  try {
    const { id } = req.params;
    const userId = req.id_user;

    const project = await db.Project.findOne({
      where: { id_projects: id, id_user: userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    await project.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    res.status(500).json({ error: 'Erro interno ao excluir projeto.' });
  }
};

export default projectController;
