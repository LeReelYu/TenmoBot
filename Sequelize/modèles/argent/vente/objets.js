const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const Objets = sequelize.define("Objets", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true, // Description optionnelle
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Objets;
