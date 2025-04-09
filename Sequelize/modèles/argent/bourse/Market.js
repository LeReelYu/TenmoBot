const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const Market = sequelize.define("Market", {
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  trend: {
    type: DataTypes.STRING,
    defaultValue: "up",
  },
  isInBankruptcy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  bankruptcySince: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  consecutiveUpCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Market;
