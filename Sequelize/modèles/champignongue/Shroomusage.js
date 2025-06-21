const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const ShroomUsage = sequelize.define("ShroomUsage", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = ShroomUsage;
