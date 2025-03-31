const { SlashCommandBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");
const daily = require("../../Sequelize/modèles/argent/daily");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-solde")
    .setDescription("Réinitialise le solde et l'état de daily d'un membre.")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur dont le solde doit être réinitialisé")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.options.getUser("utilisateur").id;

    // Vérifier si l'utilisateur a les permissions de ban
    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.reply(
        "Désolé, tu n'as pas les permissions nécessaires pour utiliser cette commande."
      );
    }

    // Chercher les données de l'utilisateur dans le modèle daily
    const dailyUser = await daily.findOne({ where: { userId: userId } });

    if (!dailyUser) {
      return interaction.reply(
        "Cet utilisateur n'a pas de données quotidiennes."
      );
    }

    // Calculer la date du jour précédent
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Réinitialiser lastClaimed à un jour avant la date actuelle
    dailyUser.lastClaimed = yesterday;

    // Sauvegarder les changements
    await dailyUser.save();

    // Réinitialiser le solde de l'utilisateur
    const user = await Economie.findOne({ where: { userId: userId } });
    if (user) {
      user.champignons = 0; // Réinitialise les champignons
      user.pièces = 0; // Réinitialise les pièces
      await user.save();
    } else {
      return interaction.reply("L'utilisateur n'a pas de compte économique.");
    }

    return interaction.reply(
      `${userId} a été réinitialisé avec succès à un solde de 0 et un dernier appel de daily au ${yesterday.toLocaleDateString()}.`
    );
  },
};
