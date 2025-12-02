/**Importando Pacotes */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import session from 'express-session';
import passport from 'passport';

/**Importanto arquivos */
import db from './models/index.js';
import passportConfig from './config/passport.js';
import { sessionConfig } from './config/sessionStore.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Passport
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passportConfig(passport);
  console.log('✅ GitHub OAuth configurado');
} else {
  console.warn('⚠️  GitHub OAuth não configurado');
}

// Configuração CORS Otimizada
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Remove a barra final para comparação
    const cleanOrigin = origin.replace(/\/$/, '');
    
    const isAllowed = allowedOrigins.some(allowed => 
      allowed && cleanOrigin === allowed.replace(/\/$/, '')
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Bloqueado:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);

// Handler de Erro Global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicialização Otimizada
async function startServer() {
  try {
    // 1. Testar Conexão
    await db.sequelize.authenticate();
    console.log('✅ Banco de dados conectado.');

    // 2. Sincronização Inteligente
    // Em produção, NÃO rodamos sync para ser rápido e seguro.
    // Em desenvolvimento, rodamos alter: true para facilitar.
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Modo Produção: Sync desativado para performance.');
    } else {
      console.log('🛠️  Modo Dev: Sincronizando tabelas...');
      await db.sequelize.sync({ alter: true });
    }

    // 3. Iniciar Servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Falha fatal na inicialização:', error);
    process.exit(1);
  }
}

startServer();