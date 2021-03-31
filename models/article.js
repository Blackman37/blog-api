'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Comment }) {

    // static associate({ User }) {
      // define association here
      // userId
      this.hasMany(Comment, { foreignKey: 'articleId' })

    }

    toJSON(){
      return { ...this.get(), id: undefined }
    }
  };
  Article.init({
    articleId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    perex: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Article must have a perex' },
        notEmpty: { msg: 'Perex must not be empty' }
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Article must have a title' },
        notEmpty : { msg: 'Title must not be empty' }
      }
    },
  }, {
    sequelize,
    tableName: 'articles',
    modelName: 'Article',
  });
  return Article;
};