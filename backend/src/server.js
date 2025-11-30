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

/**Inicializa a instância do Express */
const app = express();

const PORT = process.env.PORT || 3000; /*Porta do servidor que vem do ENV */

// Configurar Passport apenas se as variáveis do GitHub estiverem presentes
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passportConfig(passport);
  console.log('✅ GitHub OAuth configurado');
} else {
  console.warn('⚠️  GitHub OAuth não configurado (variáveis ausentes)');
}

/**Middlewares */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
); //Faz com que o frontend faça requisições para o backend

app.use(helmet()); //Adiciona camadas se segurança HTTP(Headers)
app.use(express.json()); //Express entenda JSON
app.use(express.urlencoded({ extended: true }));

// Usar a configuração de session com store do Sequelize
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

/**Rota Teste de Saúde da Api */
app.get('/api', (req, res) => {
  res.json({
    message: 'API FUNCIONANDO',
    environment: process.env.NODE_ENV || 'development',
    database: db.sequelize ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Health check simplificado
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

//Rota de autenticação(/github e /github/callback);
app.use('/api/auth', authRoutes);

//Rotas de projetos
app.use('/api/projects', projectRoutes);

//Rotas de IA
app.use('/api/ai', aiRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

/**Função para inicializar o banco de dados */
async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Base de dados conectada com sucesso!');

    // --- CORREÇÃO: Forçar sincronização em Produção ---
    // Em um app real usaríamos Migrations, mas para o MVP no Railway,
    // precisamos que o Sequelize crie as tabelas agora.
    console.log('🔄 Sincronizando modelos (alter: true)...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com sucesso!');
    // --------------------------------------------------

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar no banco de dados:', error.message);
    console.error('💡 Verifique se:');
    console.error('   1. DATABASE_URL está configurada no Railway');
    console.error('   2. O banco MySQL foi adicionado ao projeto');
    console.error('   3. As credenciais estão corretas');

    // Se falhar a conexão, não adianta iniciar sem banco neste caso
    throw error;
  }
}

/**Inicia o Servidor */
async function startServer() {
  try {
    // Inicializar banco de dados
    const dbConnected = await initializeDatabase();

    // Iniciar servidor (mesmo que o banco não conecte em produção)
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 ================================');
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(
        `🚀 Banco de Dados: ${
          dbConnected ? '✅ Conectado' : '❌ Desconectado'
        }`,
      );
      console.log(
        `🚀 GitHub OAuth: ${
          process.env.GITHUB_CLIENT_ID
            ? '✅ Configurado'
            : '⚠️  Não configurado'
        }`,
      );
      console.log('🚀 ================================');
    });
  } catch (error) {
    console.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();

// Tratamento de sinais de encerramento
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM recebido, encerrando servidor graciosamente...');
  try {
    await db.sequelize.close();
    console.log('✅ Conexão com banco de dados fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT recebido, encerrando servidor graciosamente...');
  try {
    await db.sequelize.close();
    console.log('✅ Conexão com banco de dados fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
  process.exit(0);
});
