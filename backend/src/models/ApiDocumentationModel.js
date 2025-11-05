// src/models/ApiDocumentation.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ApiDocumentation = sequelize.define('ApiDocumentation', {
    id_apiDocumentations: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_apiDocumentations'
    },
    content: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  }, {
    tableName: 'api_documentations',
    updatedAt: false,
  });

  return ApiDocumentation;
};