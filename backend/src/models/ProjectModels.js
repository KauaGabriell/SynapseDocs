import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Project = sequelize.define('Project', {
    id_projects: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_projects'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    repositoryUrl: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      field: 'repositoryUrl'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    description: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: true,      // armazenaremos aqui o “nome visível” do usuário
    }
  }, {
    tableName: 'projects',
  });

  return Project;
};
