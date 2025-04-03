const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize"); // Assure-toi de bien configurer Sequelize

const MagasinPièces = sequelize.define("MagasinPièces", {
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = MagasinPièces;
