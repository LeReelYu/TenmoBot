const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const BubbleUpgrade = sequelize.define("BubbleUpgrade", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  businessType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  upgradeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  unlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = BubbleUpgrade;
