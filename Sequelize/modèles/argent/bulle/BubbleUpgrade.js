const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const BulleUpgrade = sequelize.define("BulleUpgrade", {
  userId: {
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
});

module.exports = BulleUpgrade;
