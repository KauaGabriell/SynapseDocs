import 'dotenv/config'; // Importa e já executa o dotenv

// Exporta o objeto de configuração como "default"
export default {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT || 'mysql',

  define: {
    underscored: true,
    timestamps: true,
  },
};