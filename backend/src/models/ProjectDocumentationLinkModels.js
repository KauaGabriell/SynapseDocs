import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ProjectDocumentationLink = sequelize.define('ProjectDocumentationLink', {
    //Chave para o Projeto
    id_project: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id_projects',
      },
      unique: true, // Garante que um projeto só pode estar aqui uma vez (1-para-1)
    },
    //Chave para a Documentação
    id_apiDocumentation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'api_documentations',
        key: 'id_apiDocumentations',
      },
      unique: true, // Garante que uma doc só pode estar aqui uma vez (1-para-1)
    }
  }, {
    tableName: 'project_documentation_link',
    timestamps: false,
  });

  return ProjectDocumentationLink;
};