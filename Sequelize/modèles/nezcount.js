const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const NezStats = sequelize.define("NezStats", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = NezStats;
