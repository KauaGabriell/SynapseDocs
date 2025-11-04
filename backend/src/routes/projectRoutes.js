import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import projectController from '../controllers/projectController.js'

const router = Router();

// Proteja todas as rotas deste arquivo
// Qualquer rota definida *depois* desta linha
// exigirá um token válido.
router.use(authMiddleware);


router.get('/', authMiddleware, projectController.getProjects);
router.post('/', authMiddleware, projectController.addProjects);

export default router;