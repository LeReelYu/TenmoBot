const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const Shroom = require("../../Sequelize/modèles/champignongue/Shroom");
const ShroomUsage = require("../../Sequelize/modèles/champignongue/Shroomusage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("déminage")
    .setDescription("Tente de désamorcer un champignon dans ce salon"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const channelId = interaction.channel.id;

    const usage = await ShroomUsage.findOne({ where: { userId } });
    const now = new Date();
    const cooldown = 8 * 60 * 60 * 1000;

    if (usage && now - usage.lastUsedAt < cooldown) {
      const timeLeft = cooldown - (now - usage.lastUsedAt);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      const cooldownEmbed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle("⏳ Cooldown actif")
        .setDescription(
          `Tu dois attendre **${hours}h ${minutes}m ${seconds}s** avant de tenter un nouveau désamorçage.`
        );

      return interaction.reply({
        embeds: [cooldownEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const existing = await Shroom.findOne({ where: { channelId } });

    if (!existing) {
      await ShroomUsage.upsert({ userId, lastUsedAt: now });

      const failEmbed = new EmbedBuilder()
        .setColor(0xaa0000)
        .setTitle("❌ Échec du désamorçage")
        .setDescription(
          "Il n'y avait **aucun champignon** à désamorcer ici. Tu dois patienter 8h avant de réessayer."
        );

      return interaction.reply({
        embeds: [failEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    await existing.destroy();
    const xpGain = Math.floor(Math.random() * 15) + 1;
    await ShroomUsage.upsert({ userId, lastUsedAt: now });

    const successEmbed = new EmbedBuilder()
      .setColor(0x00aa55)
      .setTitle("🧹 Champignon désamorcé !")
      .setDescription(
        `**${interaction.user.username}** a désamorcé un champignon piégé et gagné **${xpGain} XP** !`
      );

    return interaction.reply({ embeds: [successEmbed] });
  },
};
