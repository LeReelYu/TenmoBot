const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Assure-toi que ce fichier pointe vers ta base de données existante

const RusseGlobal = sequelize.define("RusseGlobal", {
  remainingShots: {
    type: DataTypes.INTEGER,
    defaultValue: 6, // Initialement 6 balles dans le chargeur
    allowNull: false,
  },
});

// Synchronisation automatique avec la base de données
(async () => {
  await sequelize.sync();
})();

module.exports = RusseGlobal;
