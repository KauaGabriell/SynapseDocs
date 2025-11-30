import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export default async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader)
    return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.id_user = decoded.id;

    // Carrega o usuário completo e injeta na request
    const user = await db.User.findByPk(decoded.id);

    if (!user)
      return res.status(401).json({ error: 'Usuário não encontrado' });

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
