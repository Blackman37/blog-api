'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ models }) {

    // static associate({ Article }) {
      // define association here
      // this.hasMany(Article, { foreignKey: 'userId' })
    }

    toJSON(){
      return { ...this.get(), id: undefined }
    }
  };
  User.init({
    tenantId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    apiKey: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
    });
  return User;
};