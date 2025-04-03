const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("arrondir-solde")
    .setDescription("Arrondit ton solde au plus proche"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const userEconomy = await Economie.findOne({ where: { userId: userId } });

    if (!userEconomy) {
      return interaction.reply({
        content: "❌ Tu n'as pas encore de compte économique.",
      });
    }

    const soldeActuel = userEconomy.pièces;
    const soldeArrondi =
      soldeActuel % 1 >= 0.5 ? Math.ceil(soldeActuel) : Math.floor(soldeActuel);
    const difference = soldeArrondi - soldeActuel;
    const action = difference > 0 ? "gagneras" : "perdras";

    // Création de l'embed
    const embed = new EmbedBuilder()
      .setTitle("💰 Arrondi de ton solde")
      .setDescription(
        `🔵 **Ton solde actuel** : **${soldeActuel.toFixed(
          2
        )}** pièces\n📉 **Tu ${action}** : **${Math.abs(difference).toFixed(
          2
        )}** pièces\n💰 **Nouveau solde** : **${soldeArrondi}** pièces\n\n🟢 **Confirmer** pour arrondir\n🔴 **Annuler** pour ne rien changer`
      )
      .setColor(difference > 0 ? "Green" : "Red")
      .setFooter({ text: "Réponds en appuyant sur un bouton ci-dessous" });

    // Création des boutons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_arrondi")
        .setLabel("✅ Confirmer")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_arrondi")
        .setLabel("❌ Annuler")
        .setStyle(ButtonStyle.Danger)
    );

    // Envoi du message
    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    // Collecteur d'interactions (boutons)
    const filter = (i) =>
      ["confirm_arrondi", "cancel_arrondi"].includes(i.customId) &&
      i.user.id === userId;
    const collector = message.createMessageComponentCollector({
      filter,
      time: 6000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "confirm_arrondi") {
        userEconomy.pièces = soldeArrondi;
        await userEconomy.save();

        const successEmbed = new EmbedBuilder()
          .setTitle("✅ Arrondi effectué !")
          .setDescription(
            `🎉 Ton solde a été arrondi à **${soldeArrondi}** pièces.`
          )
          .setColor("Green");

        await buttonInteraction.update({
          embeds: [successEmbed],
          components: [],
        });
      } else if (buttonInteraction.customId === "cancel_arrondi") {
        const cancelEmbed = new EmbedBuilder()
          .setTitle("❌ Opération annulée")
          .setDescription("🔙 Aucun changement n'a été fait sur ton solde.")
          .setColor("Red");

        await buttonInteraction.update({
          embeds: [cancelEmbed],
          components: [],
        });
      }

      collector.stop();
    });

    collector.on("end", async (collected, reason) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle("⏳ Temps écoulé")
          .setDescription(
            "❌ L'opération d'arrondi a été annulée automatiquement."
          )
          .setColor("Grey");

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
