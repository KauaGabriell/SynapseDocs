import 'dotenv/config';

/**
 * Função para parsear a DATABASE_URL do Railway
 * Formato: mysql://user:pass@host:port/database
 */
function parseDatabaseUrl(url) {
  if (!url) return null;
  
  try {
    const regex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const match = url.match(regex);
    
    if (match) {
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5]
      };
    }
  } catch (error) {
    console.error('❌ Erro ao parsear DATABASE_URL:', error);
  }
  
  return null;
}

// Tentar usar DATABASE_URL primeiro (Railway), senão usar variáveis individuais (local)
const databaseUrl = process.env.DATABASE_URL;
const parsedUrl = parseDatabaseUrl(databaseUrl);

let config;

if (parsedUrl) {
  // ✅ Configuração para Railway (usando DATABASE_URL)
  console.log('📦 Usando DATABASE_URL do Railway');
  config = {
    username: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.database,
    host: parsedUrl.host,
    port: parsedUrl.port,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000, // 60 segundos
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    define: {
      underscored: true,
      timestamps: true,
    },
  };
} else if (process.env.DB_HOST) {
  // ✅ Configuração para desenvolvimento local (usando variáveis individuais)
  console.log('💻 Usando variáveis individuais (Desenvolvimento Local)');
  config = {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'synapsedocs',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  };
} else {
  // ⚠️ Nenhuma configuração de banco encontrada
  console.warn('⚠️  AVISO: Nenhuma configuração de banco de dados encontrada!');
  console.warn('   Configure DATABASE_URL (Railway) ou DB_HOST, DB_USER, etc (Local)');
  
  // Configuração padrão para evitar erros
  config = {
    host: 'localhost',
    username: 'root',
    password: '',
    database: 'synapsedocs',
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  };
}

export default config;