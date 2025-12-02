import db from '../models/index.js';
import analysisService from '../services/analysisService.js';
import { Op } from 'sequelize';

const projectController = {};

// GET - Listar Projetos
projectController.getProjects = async function (req, res) {
  try {
    // CORREÇÃO: Usando req.id_user consistentemente
    const userId = req.id_user;

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const offset = (page - 1) * limit;

    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';

    const where = { id_user: userId };
    
    if (status !== 'all') where.status = status;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { repositoryUrl: { [Op.like]: `%${search}%` } },
      ];
    }

    const result = await db.Project.findAndCountAll({
      where,
      include: [
        { model: db.ApiDocumentation, as: 'documentation' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Formata o retorno
    const items = result.rows.map(p => ({
      ...p.toJSON(),
      documentationUrl: p.documentation
        ? `/api/projects/${p.id_projects}/documentation`
        : null,
    }));

    res.json({
      items,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      currentPage: page,
      perPage: limit,
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

// POST - Adicionar Projeto
projectController.addProjects = async function (req, res) {
  const { name, repositoryUrl, description, language } = req.body;

  try {
    // CORREÇÃO: Usando req.id_user consistentemente
    const userId = req.id_user;

    // Tenta pegar o nome do usuário se disponível no req.user (passport)
    // Se não, usa genérico
    const authorName = req.user?.username || "Usuário";

    const newProject = await db.Project.create({
      name,
      repositoryUrl,
      description,
      language,
      id_user: userId,
      status: 'pending',
      progress: 0,
      author: authorName
    });

    // Inicia a análise (sem await para não travar a resposta)
    analysisService.analyzeRepository(newProject);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar projeto.' });
  }
};

// GET - Projeto por ID
projectController.getProjectById = async function (req, res) {
  try {
    const project = await db.Project.findOne({
      where: { 
        id_projects: req.params.id, 
        id_user: req.id_user // Segurança: Só retorna se for do usuário
      },
      include: [{ model: db.ApiDocumentation, as: 'documentation' }],
    });

    if (!project)
      return res.status(404).json({ error: 'Projeto não encontrado' });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao buscar detalhes.' });
  }
};

// GET - Documentação
projectController.getDocumentation = async function (req, res) {
  try {
    // Primeiro verifica se o projeto pertence ao usuário
    const project = await db.Project.findOne({
        where: { id_projects: req.params.id, id_user: req.id_user }
    });

    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

    const doc = await db.ApiDocumentation.findOne({
      where: { id_project: req.params.id },
    });

    if (!doc)
      return res.status(404).json({ error: 'Documentação não encontrada' });

    res.json(doc.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar documentação' });
  }
};

// DELETE - Deletar Projeto
projectController.deleteProject = async function (req, res) {
  try {
    console.log(`Tentando deletar projeto ${req.params.id} do usuário ${req.id_user}`);
    
    const project = await db.Project.findOne({
      where: { 
        id_projects: req.params.id, 
        id_user: req.id_user // Garante que o usuário é dono
      }
    });

    if (!project) {
      console.warn(`Projeto ${req.params.id} não encontrado ou não pertence ao usuário ${req.id_user}`);
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    await project.destroy();
    console.log(`Projeto ${req.params.id} deletado com sucesso`);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro interno ao excluir.' });
  }
};

export default projectController;