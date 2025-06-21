const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Shroom = require("../../Sequelize/modèles/champignongue/Shroom");
const Scout = require("../../Sequelize/modèles/champignongue/Scout");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("déminage")
    .setDescription("Tente de désamorcer un champignon dans ce salon"),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    const channelId = interaction.channel.id;

    const scout = await Scout.findOrCreate({ where: { userId } });
    const [record] = scout;

    if (record.isBannedUntilReset) {
      return interaction.editReply({
        content: "🚫 Tu es banni du jeu jusqu’au prochain reset.",
      });
    }

    const existing = await Shroom.findOne({ where: { channelId } });

    if (!existing) {
      await record.update({ isBannedUntilReset: true });
      return interaction.editReply({
        content:
          "❌ Aucun champignon à désamorcer ici. Tu es banni jusqu’au prochain reset.",
      });
    }

    await existing.destroy();
    const xpGain = Math.floor(Math.random() * 15) + 1;
    await record.increment("xp", { by: xpGain });

    return interaction.editReply({
      content: `🧹 Tu as désamorcé un champignon et gagné **${xpGain} XP** !`,
    });
  },
};
