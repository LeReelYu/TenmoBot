const { Events, ActivityType } = require("discord.js");
const config = require("../config.json");
const autofeur = require("../autoscript/autofeur");
const bjorn = require("../autoscript/bjorn");
const sequelize = require("../Sequelize/sequelize");
const fotd = require("../autoscript/fotd");
const tenmoai = require("../iatenmo/tenmoai");
const tenmohoroscope = require("../iatenmo/horoscope");
const autochannel = require("../autoscript/autochannel");
const Economie = require("../Sequelize/modèles/économie");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // On rend 'execute' asynchrone pour utiliser 'await'
    console.log(`🔥 Capitaine ${client.user.tag} au rapport !`);

    autofeur(client); // Lancement du script autofeur
    bjorn(client); // Lancement du script bjorn
    fotd(client);
    tenmoai(client);
    tenmohoroscope(client);
    autochannel(client);

    sequelize.sync().then(() => {
      console.log("📦 Base de données synchronisée !");
    });

    // 🎮 Définition de la Rich Presence dynamique
    const statuses = [
      { name: "son nombre de champignons posés", type: ActivityType.Watching },
      { name: "placer plus de champignons", type: ActivityType.Playing },
      { name: "les pleurs des faibles", type: ActivityType.Listening },
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

    console.log("🎮 Rich Presence activée !");

    // Vérifier que tous les utilisateurs dans le serveur ont une entrée dans la base de données
    try {
      // Récupérer le guildId depuis ton config.json
      const { guildId } = config;

      // Récupérer le serveur (guild)
      const guild = await client.guilds.fetch(guildId);
      const members = await guild.members.fetch(); // Récupérer tous les membres du serveur

      // Parcours de tous les membres et vérification de leur compte dans la base de données
      for (const member of members.values()) {
        const existingUser = await Economie.findOne({
          where: { userId: member.id },
        });

        if (!existingUser) {
          // Si l'utilisateur n'a pas de compte, en créer un avec un solde initial
          await Economie.create({
            userId: member.id,
            champignons: 0, // Valeur initiale pour champignons
            pièces: 0, // Valeur initiale pour pièces
          });
          console.log(`Compte créé pour ${member.user.tag}`);
        }
      }

      console.log(
        "💵Tous les comptes ont été vérifiés et créés si nécessaire."
      );
    } catch (error) {
      console.error(
        "Erreur lors de la vérification des comptes des membres:",
        error
      );
    }
  },
};
