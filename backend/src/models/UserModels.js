import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

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
      name: {
        type: DataTypes.STRING(255),
        allowNull: true, // nome para usuários manuais
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true, // username do GitHub
      },
      githubid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: false,
        field: 'githubid',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
    },
    {
      tableName: 'users',
      timestamps: false,
    },
  );

  User.prototype.validatePassword = async function (password) {
    if (!this.password_hash) return false;
    return bcrypt.compare(password, this.password_hash);
  };

  return User;
};
