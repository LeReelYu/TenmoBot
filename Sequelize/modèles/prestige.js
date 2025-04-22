const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Prestige = sequelize.define("Prestige", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prestige: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Prestige;
