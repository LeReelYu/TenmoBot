const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");

const Pets = sequelize.define("Pets", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rarity: {
    type: DataTypes.ENUM("commun", "rare", "légendaire", "mythique"),
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  effect_type: {
    type: DataTypes.STRING,
    allowNull: true, // le bonus
  },
  max_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true,
  },
  drop_rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.1, // 10% de base
    validate: {
      min: 0,
      max: 1,
    },
  },
});

module.exports = Pets;
