const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Connexion à la base de données établie !"))
  .catch((err) => console.error("❌ Erreur de connexion :", err));

module.exports = sequelize;
