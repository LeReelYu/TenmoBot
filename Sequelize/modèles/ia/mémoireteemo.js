const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize"); // Import de l'instance Sequelize

const Memory = sequelize.define(
  "Memory",
  {
    server_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement les colonnes createdAt et updatedAt
  }
);

module.exports = Memory;
