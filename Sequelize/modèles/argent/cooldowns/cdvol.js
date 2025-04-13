const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize"); // Ajustez ce chemin

const Cdvol = sequelize.define("Cdvol", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  lastAttempt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Cdvol;
