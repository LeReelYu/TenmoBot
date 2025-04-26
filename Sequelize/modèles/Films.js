const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Films = sequelize.define("Films", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Films;
