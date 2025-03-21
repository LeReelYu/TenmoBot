const { Events, ActivityType } = require("discord.js");
const { exec } = require("child_process");
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

    // 🎮 Définition de la Rich Presence dynamique
    const statuses = [
      { name: "son nombre de champignons posés", type: ActivityType.Watching },
      { name: "placer plus de champignons", type: ActivityType.Playing },
      { name: "les sons des pleurs des faibles", type: ActivityType.Listening },
    ];

    let i = 0;
    const updatePresence = () => {
      const status = statuses[i % statuses.length];
      client.user.setPresence({ activities: [status], status: "online" });
      i++;
    };

    // Définir immédiatement la présence et changer toutes les 5 minutes
    updatePresence();
    setInterval(updatePresence, 300000); // 30 minutes = 1800000 ms

    // 🚀 Démarrage d'Ollama
    /*console.log("🚀 Démarrage d'Ollama...");

    const ollamaProcess = exec("ollama serve", (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur Ollama: ${error.message}`);
        return;
      }

      if (stderr) {
        console.warn(`⚠️ Ollama: ${stderr}`);
        return;
      }

      console.log(`✅ Ollama démarré avec succès.\n${stdout}`);
    });*/

    console.log("🎮 Rich Presence activée !");
  },
};
