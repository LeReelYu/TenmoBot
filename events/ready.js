const { Events, ActivityType } = require("discord.js");
const config = require("../config.json");
const autofeur = require("../autoscript/autofeur");
const bjorn = require("../autoscript/bjorn");
const sequelize = require("../Sequelize/sequelize");
const fotd = require("../autoscript/fotd");
const tenmoai = require("../iatenmo/tenmoai");
const tenmohoroscope = require("../iatenmo/horoscope");
const autochannel = require("../autoscript/autochannel");
const Economie = require("../Sequelize/modèles/argent/économie");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`🔥 Capitaine ${client.user.tag} au rapport !`);

    autofeur(client);
    bjorn(client);
    fotd(client);
    tenmoai(client);
    tenmohoroscope(client);
    autochannel(client);

    sequelize.sync().then(() => {
      console.log("📦 Base de données synchronisée !");
    });

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

    updatePresence();
    setInterval(updatePresence, 300000);
    console.log("🎮 Rich Presence activée !");

    try {
      const { guildId } = config;
      const guild = await client.guilds.fetch(guildId);
      const members = await guild.members.fetch();

      const existingUsers = await Economie.findAll();
      const existingUserIds = existingUsers.map((user) => user.userId);

      const serverMemberIds = members.map((member) => member.id);

      // Vérification et création des comptes pour les nouveaux membres
      for (const member of members.values()) {
        if (!existingUserIds.includes(member.id)) {
          await Economie.create({
            userId: member.id,
            champignons: 0,
            pièces: 0,
          });
          console.log(`✅ Compte créé pour ${member.user.tag}`);
        }
      }

      // Suppression des comptes des membres qui ont quitté le serveur
      const membersToDelete = existingUsers.filter(
        (user) => !serverMemberIds.includes(user.userId)
      );

      if (membersToDelete.length > 0) {
        const userIdsToDelete = membersToDelete.map((user) => user.userId);
        await Economie.destroy({ where: { userId: userIdsToDelete } });

        console.log(
          `🗑️ Comptes supprimés pour ${membersToDelete.length} membres ayant quitté le serveur.`
        );
      } else {
        console.log(
          "✅ Aucun compte à supprimer, tous les utilisateurs sont encore sur le serveur."
        );
      }

      console.log("💵 Vérification et nettoyage des comptes terminés.");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la gestion des comptes des membres:",
        error
      );
    }
    console.log("successfully finished startup");
  },
};
