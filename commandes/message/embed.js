const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Envoie un embed prédéfini dans un salon spécifique.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Nécessite la permission de bannir

  async execute(interaction) {
    const channelId = "1356468520442921100"; // Remplace par l'ID du salon où tu veux envoyer l'embed

    const embed = new EmbedBuilder()
      .setTitle("❎Etat de TenmoBot❎")
      .setDescription(
        "✅Tenmo est actuellement : **😡Hors ligne**\n✅Tenmo est actuellement : **Fonctionnel**\n\n〽️Tenmo **reviendra en fin de matinée**\n\n||<@&1356439755503698060>||"
      )
      .setColor("#00b0f4")
      .setTimestamp();

    // Récupérer le salon avec l'ID et envoyer l'embed
    const channel = await interaction.client.channels.fetch(channelId);

    if (channel) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Embed envoyé dans le salon spécifié !",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Salon introuvable.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
