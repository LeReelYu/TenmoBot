const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const votefilm = sequelize.define("votefilm", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filmId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = votefilm;
