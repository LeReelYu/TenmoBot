const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const MarketHistory = sequelize.define("MarketHistory", {
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = MarketHistory;
