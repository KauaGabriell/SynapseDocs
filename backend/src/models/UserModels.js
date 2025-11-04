import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id_user',
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      githubid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'githubid',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true, // GitHub pode não fornecer um email público
        validate: {
          isEmail: true,
        },
      },
    },
    {
      tableName: 'users',
      timestamps: false,
    },
  );

  return User;
};
