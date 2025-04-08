const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Market = require("../../../Sequelize/modèles/argent/bourse/Market");
const Investment = require("../../../Sequelize/modèles/argent/bourse/Investment");
const Economie = require("../../../Sequelize/modèles/argent/économie"); // Assurez-vous que c'est le bon modèle

const COLOR = 0xffa500; // Orange
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
    .addIntegerOption(
      (option) =>
        option
          .setName("montant")
          .setDescription("Montant fixe à investir")
          .setRequired(false) // Optionnel pour les actions où le montant n'est pas nécessaire
    ),

  async execute(interaction) {
    const action = interaction.options.getString("action");
    const userId = interaction.user.id;
    const montant = interaction.options.getInteger("montant");

    // Récupérer ou créer un marché avec un prix de départ
    const market =
      (await Market.findOne()) || (await Market.create({ price: 1.0 }));

    // Fonction pour obtenir le solde des pièces de l'utilisateur
    async function getUserBalance(userId) {
      const user = await Economie.findOne({ where: { userId } });
      if (!user) return 0;
      return user.pièces; // Retourne le solde des pièces
    }

    // Fonction pour retirer des pièces de l'utilisateur
    async function removeUserBalance(userId, montant) {
      const user = await Economie.findOne({ where: { userId } });
      if (!user || user.pièces < montant) return false; // Si pas assez de pièces
      user.pièces -= montant;
      await user.save();
      return true;
    }

    // Fonction pour ajouter des pièces à l'utilisateur
    async function addUserBalance(userId, montant) {
      const user = await Economie.findOne({ where: { userId } });
      if (!user) return false;
      user.pièces += montant;
      await user.save();
      return true;
    }

    if (action === "investir") {
      // Vérifier si un montant a été spécifié
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

      // Récupérer le solde de l'utilisateur en pièces
      const balance = await getUserBalance(userId);

      // Vérifier si l'utilisateur a suffisamment de pièces
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

      // Retirer les pièces de l'utilisateur
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

      // Créer un nouvel investissement avec le montant valide
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
      // Récupérer tous les investissements de l'utilisateur
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

      // Calculer le total investi et les gains
      for (const inv of investments) {
        totalInvested += inv.amountInvested;
        const ratio = market.price / inv.priceAtInvestment;
        const gain = Math.floor(inv.amountInvested * ratio);
        totalGain += gain;
        await inv.destroy(); // Supprimer l'investissement une fois le retrait effectué
      }

      // Ajouter le total des gains au solde de l'utilisateur
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
