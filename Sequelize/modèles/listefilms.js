const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const ListeFilms = sequelize.define("ListeFilms", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = ListeFilms;
