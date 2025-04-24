const { DataTypes } = require("sequelize");
const sequelize = require("../../sequelize");

const LeaderboardTresor = sequelize.define(
  "LeaderboardTresor",
  {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalGains: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    chassesEffectuées: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = LeaderboardTresor;
