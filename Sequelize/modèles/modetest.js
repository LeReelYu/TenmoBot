const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const ModeTest = sequelize.define("ModeTest", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = ModeTest;
