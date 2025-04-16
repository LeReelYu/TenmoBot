const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Barre = sequelize.define("Barre", {
  progression: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Barre;
