import dbConfig from '../config/database.js' //Importanto as configs do banco
import { Sequelize } from 'sequelize'

/**Importando os models Criados */
import UserModels from './UserModels.js'
import ProjectModels from './ProjectModels.js'
import ProjectDocumentationLink from './ProjectDocumentationLinkModels.js'
import ApiDocumentationModel from './ApiDocumentationModel'
import ProjectDocumentationLinkModels from './ProjectDocumentationLinkModels.js'
import { FOREIGNKEYS } from 'sequelize/lib/query-types'

const db = {}; // Cria um objeto vazio para armazenar os modelos

//Inicia a conexão do Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
)

//Carrega o nosso objeto db vazio com os Models que criamos
db.User = UserModels(sequelize, Sequelize.DataTypes);
db.Project = ProjectModels(sequelize, Sequelize.DataTypes);
db.ApiDocumentation = ApiDocumentationModel(sequelize, Sequelize.DataTypes);
db.ProjectDocumentationLink = ProjectDocumentationLinkModels(sequelize, Sequelize.DataTypes);

/**Relações entre as tabelas do banco */
db.User.hasMany(db.Project, {
  foreignKey: { 
    name: 'id_user', // Nome da coluna na tabela 'projects'
    allowNull: false
  }
});
// Cada projeto pertence apenas a um usuário.
db.Project.belongsTo(db.User, {
  foreignKey: {
    name: 'id_user',
    allowNull: false
  }
});

// Relação 1-para-1: Project <-> ApiDocumentation (via Tabela de Ligação)
// Cada projeto tem uma documentação.
db.Project.belongsToMany(db.ApiDocumentation, {
  through: db.ProjectDocumentationLink,
  foreignKey: 'id_project',
  uniqueKey: 'project_api_unique' // Garante que a relação é 1-para-1
});
// Cada Documentação pertence a um único projeto.
db.ApiDocumentation.belongsToMany(db.Project, {
  through: db.ProjectDocumentationLink,
  foreignKey: 'id_apiDocumentation',
  uniqueKey: 'api_project_unique' // Garante que a relação é 1-para-1
});


//Exporta a conexão (sequelize) e o objeto 'db' (com os modelos).
db.sequelize = sequelize;
db.Sequelize = Sequelize;
