// controllers/projectController.js
import db from '../models/index.js';
import analysisService from '../services/analysisService.js';
import { Op } from 'sequelize';

const projectController = {};

/**
 * GET /api/projects
 * Query params:
 *  - page (default 1)
 *  - limit (default 10)
 *  - search (string)
 *  - status (pending | processing | completed | failed | all)
 *
 * Response:
 * {
 *   items: [ ...projects ],
 *   totalItems: 123,
 *   totalPages: 13,
 *   currentPage: 1,
 *   perPage: 10
 * }
 */
projectController.getProjects = async function (req, res) {
  try {
    const userId = req.id_user;

    // pagination params
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const offset = (page - 1) * limit;

    // filters
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';

    // where clause
    const where = { id_user: userId };
    if (status && status !== 'all') where.status = status;

    if (search) {
      // search in name, description and repositoryUrl
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { repositoryUrl: { [Op.like]: `%${search}%` } },
      ];
    }

    // find with pagination and count
    const result = await db.Project.findAndCountAll({
      where,
      include: [
        {
          model: db.ApiDocumentation,
          as: 'documentation',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalItems = result.count;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const items = result.rows.map((p) => {
      const plain = p.toJSON ? p.toJSON() : p;
      return {
        ...plain,
        documentationUrl: plain.documentation
          ? `${process.env.BACKEND_BASE_URL || 'http://localhost:3030'}/api/projects/${plain.id_projects}/documentation`
          : null,
      };
    });

    res.json({
      items,
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit,
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

// other methods kept as before (addProjects, getProjectById, getDocumentation, deleteProject)
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

projectController.getProjectById = async function (req, res) {
  const { id } = req.params;
  const userId = req.id_user;

  try {
    const project = await db.Project.findOne({
      where: {
        id_projects: id,
        id_user: userId,
      },
      include: [
        {
          model: db.ApiDocumentation,
          as: 'documentation',
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
