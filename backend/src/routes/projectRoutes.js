import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import projectController from '../controllers/projectController.js';

const router = Router();

// Protege todas as rotas
router.use(authMiddleware);

// Rotas de Coleção
router.get('/', projectController.getProjects);
router.post('/', projectController.addProjects);

// Rotas de Item (com ID)
// A rota de deletar que estava faltando ou dando erro 404
router.delete('/:id', projectController.deleteProject);

// Outras rotas específicas
router.get('/:id', projectController.getProjectById);
router.get('/:id/documentation', projectController.getDocumentation);

export default router;