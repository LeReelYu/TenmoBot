const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const CooldownCrime = sequelize.define("CooldownCrime", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = CooldownCrime;
