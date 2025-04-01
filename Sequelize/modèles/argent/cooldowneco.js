const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize"); // Ajustez ce chemin

const CooldownEco = sequelize.define("CooldownEco", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  lastAttempt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = CooldownEco;
