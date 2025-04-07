const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const Investment = sequelize.define("Investment", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amountInvested: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceAtInvestment: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  investedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Investment;
