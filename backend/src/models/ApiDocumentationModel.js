// src/models/ApiDocumentation.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ApiDocumentation = sequelize.define(
    'ApiDocumentation',
    {
      id_apiDocumentations: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_apiDocumentations',
      },
      id_project: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id_projects',
        },
        onDelete: 'CASCADE',
      },
      content: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      version: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      tableName: 'api_documentations',
      updatedAt: false,
    },
  );

  return ApiDocumentation;
};
