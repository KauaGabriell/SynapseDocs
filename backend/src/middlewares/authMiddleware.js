import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      // Capture o payload retornado por 'verify'
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Anexe o ID do usuário (do payload) ao objeto 'req'
      // para que nossas rotas futuras possam usá-lo
      req.id_user = decoded.id;

      // Deixe a requisição continuar
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  } else {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
};