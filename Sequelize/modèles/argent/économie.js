const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const Economie = sequelize.define("Economie", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  champignons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  pièces: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Economie;
