const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const BulleUser = sequelize.define("BulleUser", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  businessType: DataTypes.STRING,
  bulles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastCollect: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  entreprise: {
    type: DataTypes.STRING,
    defaultValue: "à la sauvette",
  },
  totalBulles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = BulleUser;
