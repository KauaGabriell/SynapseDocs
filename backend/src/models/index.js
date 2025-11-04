import 'dotenv/config'
import Sequelize from 'sequelize';
import dbConfig from '../config/database.js';

// Importa os modelos (INCLUINDO O LINK)
import UserModel from './UserModels.js';
import ProjectModel from './ProjectModels.js';
import ApiDocumentationModel from './ApiDocumentationModel.js';
import ProjectDocumentationLinkModel from './ProjectDocumentationLinkModels.js';

const db = {};
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    define: dbConfig.define,
    logging: false, // Mude para console.log se quiser ver as queries SQL
  }
);

// Carrega os modelos
db.User = UserModel(sequelize, Sequelize.DataTypes);
db.Project = ProjectModel(sequelize, Sequelize.DataTypes);
db.ApiDocumentation = ApiDocumentationModel(sequelize, Sequelize.DataTypes);
db.ProjectDocumentationLink = ProjectDocumentationLinkModel(sequelize, Sequelize.DataTypes);

// --- DEFINIÇÃO DAS RELAÇÕES ---

// Relação 1-para-Muitos: User -> Project
db.User.hasMany(db.Project, { 
  foreignKey: 'id_user',
  as: 'projects'
});
db.Project.belongsTo(db.User, { 
  foreignKey: 'id_user',
  as: 'user'
});

// --- RELAÇÃO 1-para-1 (VIA LINK TABLE) ---
// Um Projeto tem uma entrada na tabela de ligação
db.Project.hasOne(db.ProjectDocumentationLink, {
  foreignKey: 'id_project',
  as: 'documentationLink'
});
db.ProjectDocumentationLink.belongsTo(db.Project, {
  foreignKey: 'id_project',
  as: 'project'
});

// Uma Documentação tem uma entrada na tabela de ligação
db.ApiDocumentation.hasOne(db.ProjectDocumentationLink, {
  foreignKey: 'id_apiDocumentation',
  as: 'projectLink'
});
db.ProjectDocumentationLink.belongsTo(db.ApiDocumentation, {
  foreignKey: 'id_apiDocumentation',
  as: 'apiDocumentation'
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;