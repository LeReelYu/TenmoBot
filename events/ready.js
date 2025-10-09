const { Events, ActivityType } = require("discord.js");
const config = require("../config.json");
const autofeur = require("../autoscript/utilitaire/autofeur");
const sequelize = require("../Sequelize/sequelize");
const fotd = require("../autoscript/utilitaire/fotd");
const autochannel = require("../autoscript/utilitaire/autochannel");
const Economie = require("../Sequelize/modèles/argent/économie");
const { DateTime } = require("luxon");
const { automajbourse } = require("../autoscript/bourse/autobourse");
const scheduleCommit = require("../autoscript/utilitaire/automaj");
const boomHandler = require("../autoscript/utilitaire/boom");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`🔥 Capitaine ${client.user.tag} au rapport !`);

    autofeur(client);
    fotd(client);
    autochannel(client);
    automajbourse(client);
    boomHandler(client);
    scheduleCommit();

    sequelize.sync().then(() => {
      console.log("📦 Base de données synchronisée !");
    });

    const statuses = [
      { name: "son nombre de champignons posés", type: ActivityType.Watching },
      { name: "modifie le cours de la bourse", type: ActivityType.Playing },
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

    // ⏰ TEST DU FUSEAU HORAIRE via Luxon (ajouté à la fin du startup)
    const now = DateTime.now();
    const parisTime = DateTime.now().setZone("Europe/Paris");

    console.log("🕒 Heure système (serveur):", now.toFormat("HH:mm:ss ZZZZ"));
    console.log(
      "🇫🇷 Heure Europe/Paris    :",
      parisTime.toFormat("HH:mm:ss ZZZZ")
    );
    console.log(
      "🌍 Fuseau par défaut détecté :",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    console.log("successfully finished startup");
  },
};
