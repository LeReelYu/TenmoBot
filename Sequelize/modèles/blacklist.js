const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Blacklist = sequelize.define("Blacklist", {
  userID: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Blacklist;
