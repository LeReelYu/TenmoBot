const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blabla")
    .setDescription("Appelle Tenmo à la rescousse")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Le message que Tenmo va utiliser")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("salon")
        .setDescription("Dans quel salon envoyer le message")
        // Vérifier que ce soit bien un salon textuel
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const salon = interaction.options.getChannel("salon");
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
    await salon.send(message);
  },
};
