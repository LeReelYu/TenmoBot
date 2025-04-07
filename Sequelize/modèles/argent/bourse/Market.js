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
});

module.exports = Market;
