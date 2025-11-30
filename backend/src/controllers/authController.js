import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const authController = {};

function generateToken(user) {
  return jwt.sign({ id: user.id_user }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
}

authController.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: 'Dados incompletos' });

    // Verifica se já existe
    const exists = await db.User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ message: 'E-mail já cadastrado' });

    // Criptografa senha
    const password_hash = await bcrypt.hash(password, 10);

    // Cria usuário manual
    const newUser = await db.User.create({
      username,
      email,
      password_hash,
      githubid: null,
    });

    const token = generateToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao registrar' });
  }
};

authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.User.findOne({ where: { email } });

    if (!user || !user.password_hash)
      return res.status(401).json({ message: 'Credenciais inválidas' });

    const valid = await user.validatePassword(password);
    if (!valid)
      return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = generateToken(user);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

authController.githubCallback = async function githubCallback(req, res) {
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const payload = { id: req.user.id_user };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${frontendURL}/login-error`);
  }
};

export default authController;
