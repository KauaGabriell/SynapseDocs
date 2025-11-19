import db from '../models/index.js';
import analysisService from '../services/analysisService.js';

const projectController = {};

// Lista todos os projetos do usuário
projectController.getProjects = async function (req, res) {
  try {
    const userId = req.id_user;
    const projects = await db.Project.findAll({
      where: { id_user: userId },
      order: [['createdAt', 'DESC']], // Ordena pelos mais recentes
    });
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

// Adiciona um novo projeto e inicia a análise
projectController.addProjects = async function (req, res) {
  const { name, repositoryUrl } = req.body;
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

    // Inicia a análise em background
    analysisService.analyzeRepository(newProject);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar projeto.' });
  }
};


// Busca um projeto específico E sua documentação
projectController.getProjectById = async function (req, res) {
  const { id } = req.params;
  const userId = req.id_user;

  try {
    const project = await db.Project.findOne({
      where: { 
        id_projects: id,
        id_user: userId // Segurança: Garante que o projeto pertence ao usuário logado
      },
      // O "Pulo do Gato": Traz a documentação associada junto!
      include: [{
        model: db.ApiDocumentation,
        as: 'ApiDocumentation' // (O Sequelize gera esse alias automaticamente pelo hasOne)
      }]
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

export default projectController;