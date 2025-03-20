const { Events } = require("discord.js");
const autofeur = require("../autoscript/autofeur");
const bjorn = require("../autoscript/bjorn");
const sequelize = require("../Sequilize/sequelize");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`🔥 Capitaine ${client.user.tag} au rapport !`);

    autofeur(client); // Lancement du script autofeur
    bjorn(client); // Lancement du script bjorn

    sequelize.sync().then(() => {
      console.log("📦 Base de données synchronisée !");
    });
  },
};
