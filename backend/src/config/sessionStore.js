// backend/src/config/sessionStore.js
import session from 'express-session';
import SequelizeStore from 'connect-session-sequelize';
import db from '../models/index.js';

// Criar store do Sequelize
const SessionStore = SequelizeStore(session.Store);

const sessionStore = new SessionStore({
  db: db.sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000, // Limpar sessions expiradas a cada 15 minutos
  expiration: 24 * 60 * 60 * 1000 // Sessions expiram em 24 horas
});

// Sincronizar a tabela de sessions (criar se não existir)
sessionStore.sync();

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: true, // Importante para Railway/Heroku
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
};

export default sessionStore;