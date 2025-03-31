const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Economie = sequelize.define("Economie", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  champignons: {
    // Monnaie rare
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  pièces: {
    // Monnaie commune
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

// Synchronisation automatique avec la base de données
(async () => {
  await sequelize.sync();
})();

module.exports = Economie;
