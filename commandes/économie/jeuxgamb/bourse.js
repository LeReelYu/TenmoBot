const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { DateTime } = require("luxon"); // Ajouté pour la gestion du temps
const Market = require("../../../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../../../Sequelize/modèles/argent/bourse/Investment");
const Economie = require("../../../Sequelize/modèles/argent/économie");

const COLOR = 0xffa500;
const GIF_MAIN =
  "https://upload-os-bbs.hoyolab.com/upload/2023/10/15/239582276/709d77d2a814e042dd293e30aa87ae0f_7084346633459396140.gif";
const GIF_ACTION = "https://honkai.gg/wp-content/uploads/topaz-ultimate.gif";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bourse")
    .setDescription("Gère tes investissements en Maocoin")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Choisir une action à effectuer")
        .setRequired(true)
        .addChoices(
          { name: "Investir", value: "investir" },
          { name: "Retirer", value: "retirer" },
          { name: "Voir le cours", value: "cours" },
          { name: "Voir mon portefeuille", value: "portfolio" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Montant fixe à investir")
        .setRequired(false)
    ),

  async execute(interaction) {
    const action = interaction.options.getString("action");
    const userId = interaction.user.id;
    const montant = interaction.options.getInteger("montant");

    const market =
      (await Market.findOne()) || (await Market.create({ price: 1.0 }));

    async function getUserBalance(userId) {
      const user = await Economie.findOne({ where: { userId } });
      if (!user) return 0;
      return user.pièces;
    }

    async function removeUserBalance(userId, montant) {
      const user = await Economie.findOne({ where: { userId } });
      if (!user || user.pièces < montant) return false;
      user.pièces -= montant;
      await user.save();
      return true;
    }

    async function addUserBalance(userId, montant) {
      const user = await Economie.findOne({ where: { userId } });
      if (!user) return false;
      user.pièces += montant;
      await user.save();
      return true;
    }

    if (action === "investir") {
      if (!montant || montant <= 0) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle("💸 Montant invalide")
          .setDescription("Tu dois spécifier un montant valide pour investir.")
          .setImage(GIF_ACTION);
        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const balance = await getUserBalance(userId);

      if (balance < montant) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle("💸 Fonds insuffisants")
          .setDescription(
            "Tu n'as pas assez de pièces pour cet investissement."
          )
          .setImage(GIF_ACTION);
        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const success = await removeUserBalance(userId, montant);
      if (!success) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle("❌ Erreur")
          .setDescription("Impossible de retirer tes pièces.")
          .setImage(GIF_ACTION);
        return interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }

      await Investment.create({
        userId,
        amountInvested: montant,
        priceAtInvestment: market.price,
      });

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle("📈 Investissement confirmé")
        .setDescription(
          `Tu as investi **${montant} pièces** dans le Maocoin à **${market.price.toFixed(
            4
          )} pièces/unité**.`
        )
        .setImage(GIF_ACTION);
      return interaction.reply({ embeds: [embed] });
    }

    if (action === "retirer") {
      const investments = await Investment.findAll({ where: { userId } });

      if (investments.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle("🫥 Aucun investissement")
          .setDescription("Tu n’as aucun investissement actif.")
          .setImage(GIF_ACTION);
        return interaction.reply({ embeds: [embed] });
      }

      let totalInvested = 0;
      let totalGain = 0;

      for (const inv of investments) {
        totalInvested += inv.amountInvested;
        const ratio = market.price / inv.priceAtInvestment;
        const gain = Math.floor(inv.amountInvested * ratio);
        totalGain += gain;
        await inv.destroy();
      }

      await addUserBalance(userId, totalGain);

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle("💰 Retrait effectué")
        .setDescription(
          `Tu as récupéré **${totalGain} pièces** suite à tes investissements.`
        )
        .setImage(GIF_ACTION);
      return interaction.reply({ embeds: [embed] });
    }

    if (action === "cours") {
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle("📊 Cours du Maocoin")
        .setDescription(
          `Le cours actuel est de **${market.price.toFixed(4)} pièces/unité**.`
        )
        .setImage(GIF_MAIN);

      // Ajout du délai avant la prochaine mise à jour
      const now = DateTime.now();
      const lastUpdate = DateTime.fromJSDate(market.updatedAt);
      const nextUpdate = lastUpdate.plus({ hours: 2 });
      const remaining = nextUpdate.diff(now, ["hours", "minutes"]).toObject();

      let timeRemainingText = "";
      if (remaining.hours > 0) {
        timeRemainingText += `${Math.floor(remaining.hours)}h `;
      }
      timeRemainingText += `${Math.ceil(remaining.minutes)} min`;

      embed.setFooter({
        text: `⏳ Prochaine évolution dans ${timeRemainingText}`,
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (action === "portfolio") {
      const investments = await Investment.findAll({ where: { userId } });

      if (investments.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(COLOR)
          .setTitle("🧺 Portefeuille vide")
          .setDescription("Tu n’as aucun investissement en cours.")
          .setImage(GIF_MAIN);
        return interaction.reply({ embeds: [embed] });
      }

      let totalInvested = 0;
      let totalCurrent = 0;

      for (const inv of investments) {
        totalInvested += inv.amountInvested;
        totalCurrent +=
          inv.amountInvested * (market.price / inv.priceAtInvestment);
      }

      const gainLoss = totalCurrent - totalInvested;
      const status = gainLoss >= 0 ? "📈 Gain" : "📉 Perte";
      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle("🧾 Ton portefeuille")
        .setDescription(
          `**Investi :** ${totalInvested} pièces\n` +
            `**Valeur actuelle :** ${Math.floor(totalCurrent)} pièces\n` +
            `**${status} :** ${Math.floor(gainLoss)} pièces`
        )
        .setImage(GIF_MAIN);
      return interaction.reply({ embeds: [embed] });
    }
  },
};
