/**Importando Pacotes */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression' // ⚡ NOVO
import 'dotenv/config'
import session from 'express-session';
import passport from 'passport'

/**Importanto arquivos */
import db from './models/index.js'
import passportConfig from './config/passport.js'
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

/**Inicializa a instância do Express */
const app = express();

const PORT = process.env.PORT || 3000;

// Configurar Passport apenas se as variáveis do GitHub estiverem presentes
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passportConfig(passport);
    console.log('✅ GitHub OAuth configurado');
} else {
    console.warn('⚠️  GitHub OAuth não configurado (variáveis ausentes)');
}

/**Middlewares - ORDEM IMPORTA! */ 

// ⚡ 1. COMPRESSÃO (ANTES de tudo)
app.use(compression({
    level: 6, // Nível de compressão (1-9)
    threshold: 1024, // Só comprimir se resposta > 1KB
    filter: (req, res) => {
        // Não comprimir se já estiver comprimido ou for streaming
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// 2. CORS com configurações otimizadas
app.use(cors({
    origin: [
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    maxAge: 86400 // Cache preflight por 24h
}));

// 3. Helmet para segurança
app.use(helmet());

// 4. Body parsers
app.use(express.json({ limit: '10mb' })); // Limitar tamanho
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Session
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session())

// ⚡ MIDDLEWARE DE CACHE SIMPLES (sem Redis)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function simpleCache(req, res, next) {
    // Só cachear GET requests
    if (req.method !== 'GET') return next();
    
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('💾 Cache HIT:', key);
        return res.json(cached.data);
    }
    
    // Interceptar res.json para salvar no cache
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        if (res.statusCode === 200) {
            cache.set(key, {
                data,
                timestamp: Date.now()
            });
            
            // Limpar cache antigo
            if (cache.size > 100) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
        }
        return originalJson(data);
    };
    
    next();
}

// ⚡ MIDDLEWARE DE PERFORMANCE LOGGING
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const emoji = duration < 100 ? '⚡' : duration < 500 ? '🐌' : '🐢';
        console.log(`${emoji} ${req.method} ${req.path} - ${duration}ms`);
        
        if (duration > 1000) {
            console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
        }
    });
    
    next();
});

/**Rota Teste de Saúde da Api */
app.get('/api', (req, res) => {
    res.json({
        message: 'API FUNCIONANDO',
        environment: process.env.NODE_ENV || 'development',
        database: db.sequelize ? 'connected' : 'disconnected',
        cache: cache.size,
        timestamp: new Date().toISOString()
    })
})

// Health check simplificado
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
})

// ⚡ Aplicar cache nas rotas de leitura
app.use('/api/auth', authRoutes);
app.use('/api/projects', simpleCache, projectRoutes); // Cache aqui!
app.use('/api/ai', aiRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

/**Função para inicializar o banco de dados */
async function initializeDatabase() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Base de dados conectada com sucesso!');
        
        // Sincronizar apenas em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
            await db.sequelize.sync({ alter: true });
            console.log('✅ Modelos sincronizados');
        } else {
            console.log('ℹ️  Modo produção: sincronização automática desabilitada');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar no banco de dados:', error.message);
        
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️  Servidor iniciando sem banco de dados');
            return false;
        }
        
        throw error;
    }
}

/**Inicia o Servidor */
async function startServer() {
    try {
        // Inicializar banco de dados
        const dbConnected = await initializeDatabase();
        
        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 ================================');
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 Banco de Dados: ${dbConnected ? '✅ Conectado' : '❌ Desconectado'}`);
            console.log(`🚀 GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? '✅' : '⚠️'}`);
            console.log(`⚡ Compressão: ✅ Ativada`);
            console.log(`💾 Cache: ✅ Ativado (em memória)`);
            console.log('🚀 ================================');
        });
        
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar o servidor
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('👋 SIGTERM recebido, encerrando graciosamente...');
    cache.clear();
    try {
        await db.sequelize.close();
        console.log('✅ Conexão com banco fechada');
    } catch (error) {
        console.error('❌ Erro ao fechar conexão:', error);
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('👋 SIGINT recebido, encerrando graciosamente...');
    cache.clear();
    try {
        await db.sequelize.close();
        console.log('✅ Conexão com banco fechada');
    } catch (error) {
        console.error('❌ Erro ao fechar conexão:', error);
    }
    process.exit(0);
});