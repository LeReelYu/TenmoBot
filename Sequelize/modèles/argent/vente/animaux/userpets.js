const { DataTypes } = require("sequelize");
const sequelize = require("../../../../sequelize");
const Pets = require("./pets");

const UserPets = sequelize.define("UserPets", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Pets",
      key: "id",
    },
  },
  is_equipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Relation : un UserPet appartient à un pet
UserPets.belongsTo(Pets, { foreignKey: "petId", as: "pet" });

module.exports = UserPets;
