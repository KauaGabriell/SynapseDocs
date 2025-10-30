// src/models/ApiDocumentation.js

// 1. Importamos 'DataTypes'
import { DataTypes } from 'sequelize';

// 2. Exportamos a função
export default (sequelize) => {
  const ApiDocumentation = sequelize.define('ApiDocumentation', {
    id_apiDocumentations: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_apiDocumentations' // Nome exato da coluna 
    },
    content: {
      type: DataTypes.JSON, 
      allowNull: true,      // Pode começar nulo antes da IA processar
    },
    version: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  }, {
    tableName: 'api_documentations', // Nome exato da tabela
    updatedAt: false, 
  });

  return ApiDocumentation;
};