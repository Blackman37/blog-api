'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      // define association here
      
      this.belongsTo(User, { foreignKey: 'userId' })
    }

    toJSON(){
      return { ...this.get(), id: undefined, userId: undefined }
    }
  };
  Comment.init({
    commentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Comment must have a content' },
        notEmpty: { msg: 'Content must not be empty' }
      }
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 200 }
    }
  }, {
    sequelize,
    tableName: 'comments',
    modelName: 'Comment',
  });
  return Comment;
};