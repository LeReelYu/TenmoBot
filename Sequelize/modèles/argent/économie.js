const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const Economie = sequelize.define("Economie", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  champignons: {
    // Monnaie rare (ne peut pas être négative)
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0, // Empêche les valeurs négatives
    },
  },
  pièces: {
    // Monnaie commune (peut être négative)
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false, // Toujours défini
  },
});

module.exports = Economie;
