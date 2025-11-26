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
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      githubid: {
        type: DataTypes.STRING(255),
        allowNull: true, // Agora pode ser null para login manual
        unique: false,
        field: 'githubid',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true, // Null para usuários do GitHub
      }
    },
    {
      tableName: 'users',
      timestamps: false,
    },
  );

  // Método para validar senha
  User.prototype.validatePassword = async function (password) {
    if (!this.password_hash) return false; 
    return bcrypt.compare(password, this.password_hash);
  };

  return User;
};
