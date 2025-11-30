import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import projectController from '../controllers/projectController.js';

const router = Router();

// Protege todas as rotas
router.use(authMiddleware);

// GET /api/projects (Lista todos)
router.get('/', projectController.getProjects);

// POST /api/projects (Cria novo)
router.post('/', projectController.addProjects);

// GET /api/projects/:id (Detalhes de um projeto específico)
// Ex: /api/projects/1
router.get('/:id', projectController.getProjectById);

// routes/projectRoutes.js
// import já existente e authMiddleware
router.get('/:id/documentation', projectController.getDocumentation);
router.delete('/:id', projectController.deleteProject);



export default router;
