import 'dotenv/config';
import Sequelize from 'sequelize';
import dbConfig from '../config/database.js';

// Importa os modelos
import UserModel from './UserModels.js';
import ProjectModel from './ProjectModels.js';
import ApiDocumentationModel from './ApiDocumentationModel.js';

const db = {};
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

// Carrega os modelos
db.User = UserModel(sequelize, Sequelize.DataTypes);
db.Project = ProjectModel(sequelize, Sequelize.DataTypes);
db.ApiDocumentation = ApiDocumentationModel(sequelize, Sequelize.DataTypes);

// --- DEFINIÇÃO DAS RELAÇÕES ---

// 1. User <-> Project
db.User.hasMany(db.Project, {
  foreignKey: { name: 'id_user', allowNull: false },
});
db.Project.belongsTo(db.User, {
  foreignKey: { name: 'id_user', allowNull: false },
});

// 2. Project <-> ApiDocumentation (1-para-1)
// AQUI ESTÁ A DEFINIÇÃO:
db.Project.hasOne(db.ApiDocumentation, {
  foreignKey: 'id_project',
  as: 'documentation', // <--- O apelido é definido aqui
});

db.ApiDocumentation.belongsTo(db.Project, {
  foreignKey: 'id_project',
  as: 'project',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
