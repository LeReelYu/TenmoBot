const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Assure-toi que ce fichier pointe vers ta base de données existante

const RouletteGame = sequelize.define("RouletteGame", {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  remainingShots: {
    type: DataTypes.INTEGER,
    defaultValue: 6,
    allowNull: false,
  },
});

// Synchronisation automatique avec la base de données
(async () => {
  await sequelize.sync();
})();

module.exports = RouletteGame;
