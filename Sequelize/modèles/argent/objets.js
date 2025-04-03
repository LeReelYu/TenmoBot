const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize"); // Assure-toi que Sequelize est bien configuré et accessible

const Objets = sequelize.define("Objets", {
  name: {
    type: DataTypes.STRING,
    allowNull: false, // Le nom de l'objet est requis
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true, // Description optionnelle
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false, // Le prix de l'objet est requis
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Par défaut, il n'y a pas de stock
  },
});

// Ce modèle peut être utilisé pour récupérer les objets de la table "Objets"

module.exports = Objets;
