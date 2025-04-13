const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const daily = sequelize.define("daily", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  lastClaimed: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = daily;
