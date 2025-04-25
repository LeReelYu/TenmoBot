const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const NoteFilms = sequelize.define("NoteFilms", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
});

module.exports = NoteFilms;
