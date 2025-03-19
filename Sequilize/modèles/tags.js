const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Tags = sequelize.define("Tags", {
  name: {
    type: DataTypes.STRING,
    unique: true,
  },
  description: DataTypes.TEXT,
  username: DataTypes.STRING,
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Tags;
