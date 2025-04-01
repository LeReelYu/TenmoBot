const { SlashCommandBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");
const daily = require("../../Sequelize/modèles/argent/daily");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-global")
    .setDescription(
      "Réinitialise le solde et l'état de daily de tous les membres du serveur."
    ),

  async execute(interaction) {
    // Vérifier si l'utilisateur a les permissions d'administrateur
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content:
          "🚫 Tu n'as pas les permissions nécessaires pour utiliser cette commande.",
        ephemeral: true,
      });
    }

    // Récupérer tous les enregistrements des utilisateurs dans les modèles
    const allUsers = await Economie.findAll();
    const allDailyUsers = await daily.findAll();

    if (allUsers.length === 0) {
      return interaction.reply(
        "⚠️ Aucun utilisateur avec un solde enregistré."
      );
    }

    // Réinitialiser les soldes de tous les membres
    for (const user of allUsers) {
      user.champignons = 0;
      user.pièces = 0;
      await user.save();
    }

    // Réinitialiser les récompenses quotidiennes pour tous
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    for (const dailyUser of allDailyUsers) {
      dailyUser.lastClaimed = yesterday;
      await dailyUser.save();
    }

    return interaction.reply(
      "✅ Tous les soldes et états de daily ont été réinitialisés !"
    );
  },
};
