const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const film = sequelize.define("film", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_visionnage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = film;
