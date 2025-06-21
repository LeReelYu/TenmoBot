const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Note = sequelize.define("Note", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  noteName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Note;
