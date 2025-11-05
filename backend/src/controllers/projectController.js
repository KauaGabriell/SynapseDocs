import db from '../models/index.js';

const projectController = {};

projectController.getProjects = async function (req, res) {
  try {
    const userId = req.id_user;
    const projects = await db.Project.findAll({ where: { id_user: userId } });
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

projectController.addProjects = async function (req, res) {
  const { name, repositoryUrl } = req.body;
  try {
    const userId = req.id_user;
    const newProject = await db.Project.create({
      name,
      repositoryUrl,
      id_user: userId,
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

export default projectController;
