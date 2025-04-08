const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { updateMarketPrice } = require("../../../autoscript/autobourse"); // adapte le chemin si besoin

module.exports = {
  data: new SlashCommandBuilder()
    .setName("majchart")
    .setDescription("Force une mise à jour de la bourse (admin uniquement)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      // Mise à jour forcée
      await updateMarketPrice(interaction.client);

      await interaction.editReply({
        content: "✅ Mise à jour du marché effectuée avec succès !",
      });

      console.log(
        `[ADMIN] ${interaction.user.tag} a forcé une mise à jour du marché.`
      );
    } catch (err) {
      console.error("❌ Erreur dans la commande /majchart :", err);
      await interaction.editReply({
        content: "❌ Une erreur est survenue pendant la mise à jour du marché.",
      });
    }
  },
};
