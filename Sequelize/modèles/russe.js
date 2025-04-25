const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

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
