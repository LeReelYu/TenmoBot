const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");
const daily = require("../../Sequelize/modèles/argent/daily");
const CooldownEco = require("../../Sequelize/modèles/argent/cooldowneco");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-solde")
    .setDescription("Réinitialise le solde et l'état de daily d'un membre.")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Utilisateur dont le solde doit être réinitialisé")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("reset_vol")
        .setDescription("Réinitialiser également le cooldown du vol ?")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getUser("utilisateur").id;
    const resetVol = interaction.options.getBoolean("reset_vol") || false;

    // Vérifier si l'utilisateur a les permissions de ban
    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.reply({
        content:
          "Désolé, tu n'as pas les permissions nécessaires pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Réinitialisation du daily
    const dailyUser = await daily.findOne({ where: { userId: userId } });
    if (!dailyUser) {
      return interaction.reply({
        content: "Cet utilisateur n'a pas de données quotidiennes.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    dailyUser.lastClaimed = yesterday;
    await dailyUser.save();

    // Réinitialisation du solde
    const user = await Economie.findOne({ where: { userId: userId } });
    if (user) {
      user.champignons = 0;
      user.pièces = 0;
      await user.save();
    } else {
      return interaction.reply({
        content: "L'utilisateur n'a pas de compte économique.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Réinitialisation du cooldown de vol si demandé
    if (resetVol) {
      await CooldownEco.destroy({ where: { userId: userId } });
    }

    return interaction.reply({
      content: `${userId} a été réinitialisé avec succès à un solde de 0 et un dernier appel de daily au ${yesterday.toLocaleDateString()}.${
        resetVol ? " Le cooldown du vol a aussi été réinitialisé." : ""
      }`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
