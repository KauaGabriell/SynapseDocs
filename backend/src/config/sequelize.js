import { Sequelize } from 'sequelize';
import databaseConfig from './database.js';

// Criar instância do Sequelize
const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: databaseConfig.dialect,
    logging: databaseConfig.logging,
    dialectOptions: databaseConfig.dialectOptions || {},
    pool: databaseConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: databaseConfig.define
  }
);

// Função para testar e inicializar a conexão
export async function initializeDatabase() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Sincronizar modelos (cuidado em produção!)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados');
    } else {
      console.log('ℹ️  Modo produção: sincronização automática desabilitada');
      console.log('💡 Execute migrations manualmente se necessário');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar no banco de dados:');
    console.error('   Mensagem:', error.message);
    
    if (error.original) {
      console.error('   Detalhes:', error.original.message);
    }
    
    console.error('\n💡 Verifique:');
    console.error('   1. DATABASE_URL está configurada no Railway?');
    console.error('   2. O banco MySQL está rodando?');
    console.error('   3. As credenciais estão corretas?');
    
    // Não encerrar o processo, apenas retornar false
    return false;
  }
}

export default sequelize;