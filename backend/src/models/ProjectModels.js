// 1. Importamos 'DataTypes'
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Project = sequelize.define('Project', {
    id_projects: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_projects' // Nome exato da coluna 
    },
    name: {
      type: DataTypes.STRING(255), 
      allowNull: false, // Um projeto deve ter um nome
    },
    repositoryUrl: {
      type: DataTypes.STRING(2048),
      allowNull: false, // Precisa da URL para ser analisado
      field: 'repositoryUrl'
    },
    status: {
      // O tipo ENUM garante que o status só pode ser um desses valores 
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending', // Um novo projeto sempre começa como 'pending'
    },
  }, {
    tableName: 'projects', // Define o nome exato da tabela
  });

  return Project;
};