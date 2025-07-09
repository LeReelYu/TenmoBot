const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Taglist = sequelize.define("Taglist", {
  term: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Taglist;
