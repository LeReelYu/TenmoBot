const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");
const Objets = require("./objets");

const Inventaire = sequelize.define("Inventaire", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false, // L'ID de l'objet est requis
    references: {
      model: "Objets", // Référence à la table "Objets"
      key: "id", // Clé primaire de la table "Objets"
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false, // La quantité de l'objet dans l'inventaire est requise
    defaultValue: 1, // Par défaut, l'utilisateur possède 1 exemplaire de l'objet acheté
  },
});

// Association : Un inventaire appartient à un objet (un objet peut être dans plusieurs inventaires)
Inventaire.belongsTo(Objets, { foreignKey: "itemId", as: "objet" });

module.exports = Inventaire;
