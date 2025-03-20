const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Build = sequelize.define("Builds", {
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Nom du personnage obligatoire
    unique: true, // Un personnage unique
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // L'image peut être vide au début
  },
});

module.exports = Build;
