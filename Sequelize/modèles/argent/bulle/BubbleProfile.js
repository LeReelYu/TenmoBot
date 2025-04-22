const { DataTypes } = require("sequelize");
const sequelize = require("../../../sequelize");

const BubbleProfile = sequelize.define("BubbleProfile", {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  bubbles: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  businessType: {
    type: DataTypes.STRING,
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  passiveRate: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  lastPassiveTick: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = BubbleProfile;
