const { Events, ActivityType } = require("discord.js");
const autofeur = require("../autoscript/autofeur");
const bjorn = require("../autoscript/bjorn");
const sequelize = require("../Sequelize/sequelize");

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

    // 🎮 Définition de la Rich Presence dynamique (changement toutes les 30 minutes)
    const statuses = [
      { name: "son nombre de champignons posés", type: ActivityType.Watching },
      { name: "placer plus de champignons", type: ActivityType.Playing },
      { name: "les sons des pleurs des faibles", type: ActivityType.Listening },
    ];

    let i = 0;
    const updatePresence = () => {
      const status = statuses[i % statuses.length];
      client.user.setPresence({ activities: [status], status: "online" });
      /*console.log(`🎮 Nouveau statut : ${status.name}`);*/ // Remettre si je veux notifier le changement de statut.
      i++;
    };

    // Définir immédiatement la présence et changer toutes les 5 minutes
    updatePresence();
    setInterval(updatePresence, 300000); // 30 minutes = 1800000 ms

    console.log("🎮 Rich Presence activée !");
  },
};
