const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription(
      "Supprime un certain nombre de messages dans le salon où la commande est lancée."
    )
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Le nombre de messages à supprimer (max 100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Vérification des permissions (kick des membres)
    if (!interaction.member.permissions.has("KICK_MEMBERS")) {
      return interaction.reply({
        content:
          'Vous devez avoir la permission de "Kick des membres" pour utiliser cette commande.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const nombre = interaction.options.getInteger("nombre");
    const salon = interaction.channel; // Le salon où la commande a été lancée

    // Vérifier que le nombre de messages est valide (entre 1 et 100)
    if (nombre < 1 || nombre > 100) {
      return interaction.reply({
        content:
          "Veuillez spécifier un nombre de messages à supprimer entre 1 et 100.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Vérifier que le bot a la permission de gérer les messages dans le salon
    if (!salon.permissionsFor(interaction.client.user).has("MANAGE_MESSAGES")) {
      return interaction.reply({
        content:
          "Je n'ai pas la permission de supprimer des messages dans ce salon.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // Supprimer les messages
      const messages = await salon.messages.fetch({ limit: nombre });
      await salon.bulkDelete(messages);

      // Répondre à l'utilisateur
      return interaction.reply({
        content: `J'ai supprimé ${messages.size} message(s) dans ce salon.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "Une erreur s'est produite lors de la suppression des messages.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
