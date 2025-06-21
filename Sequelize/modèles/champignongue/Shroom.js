const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const Shroom = sequelize.define("Shroom", {
  channelId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  placedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Shroom;
