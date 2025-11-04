import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Proteja todas as rotas deste arquivo
// Qualquer rota definida *depois* desta linha
// exigirá um token válido.
router.use(authMiddleware);

//    (GET para /api/projects/)
router.get('/', (req, res) => {
  //    Agora temos acesso ao ID do usuário que o middleware decodificou.
  res.json({
    message: 'Você está autenticado! Esta é uma rota protegida.',
    userId: req.id_user // req.id_user foi anexado pelo authMiddleware
  });
});

export default router;