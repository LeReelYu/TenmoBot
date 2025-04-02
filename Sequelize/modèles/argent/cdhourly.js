const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const Hourly = sequelize.define("hourly", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  lastClaimed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Hourly;
