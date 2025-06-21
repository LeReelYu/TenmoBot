const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const Scout = sequelize.define("Scout", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  xp: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Scout;
