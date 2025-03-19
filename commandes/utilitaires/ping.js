const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping le bot pour voir comment il va"),
  async execute(interaction) {
    // Vérifier si l'utilisateur a la permission de kick des membres
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "Tu n'as pas la permission de faire ça.",
        ephemeral: true, // Message éphémère
      });
    }

    // Si toutes les vérifications sont passées, on envoie la réponse
    await interaction.reply({
      content: "Pong!",
      ephemeral: true, // Message éphémère
    });
  },
};
