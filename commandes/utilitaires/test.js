const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const ModeTest = require("../../Sequelize/modèles/modetest");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modetest")
    .setDescription(
      "Active ou désactive le mode test du bot (limite à un seul salon)."
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Seuls ceux qui peuvent bannir peuvent l'utiliser
    .addBooleanOption((option) =>
      option
        .setName("activer")
        .setDescription("Activer ou désactiver le mode test")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("salon")
        .setDescription("Salon où le bot pourra fonctionner (si activé)")
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const enable = interaction.options.getBoolean("activer");
    const channel = interaction.options.getChannel("salon");

    if (enable && !channel) {
      return interaction.reply({
        content: "Tu dois spécifier un salon pour activer le mode test !",
        flags: MessageFlags.Ephemeral,
      });
    }

    await ModeTest.upsert({
      guildId: guildId,
      enabled: enable,
      channelId: enable ? channel.id : null,
    });

    interaction.reply(
      enable
        ? `✅ Mode test activé ! Le bot ne répondra qu'aux messages dans <#${channel.id}>.`
        : "❌ Mode test désactivé ! Le bot fonctionne normalement."
    );
  },
};
