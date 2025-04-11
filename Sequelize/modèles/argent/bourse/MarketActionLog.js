const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const MarketActionLog = sequelize.define("MarketActionLog", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM("invest", "retire"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = MarketActionLog;
