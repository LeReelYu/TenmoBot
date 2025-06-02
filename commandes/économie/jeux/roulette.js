const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

const ROUGE = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];
const NOIR = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Joue à la roulette et tente ta chance !")
    .addIntegerOption((option) =>
      option
        .setName("mise")
        .setDescription("Nombre de pièces à miser")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("pari")
        .setDescription("Type de pari")
        .setRequired(true)
        .addChoices(
          { name: "Rouge", value: "rouge" },
          { name: "Noir", value: "noir" },
          { name: "Pair", value: "pair" },
          { name: "Impair", value: "impair" },
          { name: "Numéro", value: "numero" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("valeur")
        .setDescription("Numéro entre 0 et 36 (nécessaire si pari sur numéro)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const mise = interaction.options.getInteger("mise");
    const typePari = interaction.options.getString("pari");
    const numeroChoisi = interaction.options.getInteger("valeur");
    const userId = interaction.user.id;

    const userEco = await Economie.findByPk(userId);
    if (!userEco || userEco.pièces < mise || mise <= 0) {
      return interaction.reply({
        content: "❌ Tu n'as pas assez de pièces ou la mise est invalide.",
        ephemeral: true,
      });
    }

    if (
      typePari === "numero" &&
      (numeroChoisi === null || numeroChoisi < 0 || numeroChoisi > 36)
    ) {
      return interaction.reply({
        content: "❌ Tu dois choisir un **numéro entre 0 et 36** pour ce pari.",
        ephemeral: true,
      });
    }

    // Embed initial de suspense
    const suspenseEmbed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("🎰 Roulette en cours...")
      .setDescription("La bille tourne... 🎲 Roulements en cours...")
      .setImage("https://media.tenor.com/WXWv7tcyDw8AAAAC/roulette.gif")
      .setFooter({
        text: `Pari de ${mise} pièces - ${interaction.user.username}`,
      });

    await interaction.reply({ embeds: [suspenseEmbed] });

    // Délai de suspense (3 secondes)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Tirage du numéro
    const tirage = Math.floor(Math.random() * 37);
    const couleur = ROUGE.includes(tirage)
      ? "rouge"
      : NOIR.includes(tirage)
      ? "noir"
      : "vert";
    const estPair = tirage !== 0 && tirage % 2 === 0;

    let aGagné = false;
    let gain = 0;
    let details = "";

    switch (typePari) {
      case "numero":
        if (tirage === numeroChoisi) {
          gain = mise * 25;
          aGagné = true;
          details = `Tu as parié sur **${numeroChoisi}**, tirage : **${tirage}**. 🎯`;
        } else {
          details = `Tu as parié sur **${numeroChoisi}**, tirage : **${tirage}**.`;
        }
        break;

      case "rouge":
      case "noir":
        if (couleur === typePari) {
          gain = Math.floor(mise * 1.5);
          aGagné = true;
          details = `Tu as parié sur **${typePari}**, tirage : **${tirage} (${couleur})**. 🔴⚫`;
        } else {
          details = `Tu as parié sur **${typePari}**, tirage : **${tirage} (${couleur})**.`;
        }
        break;

      case "pair":
      case "impair":
        if (
          (typePari === "pair" && estPair) ||
          (typePari === "impair" && !estPair && tirage !== 0)
        ) {
          gain = Math.floor(mise * 1.1);
          aGagné = true;
          details = `Tu as parié sur **${typePari}**, tirage : **${tirage}**. ✔️`;
        } else {
          details = `Tu as parié sur **${typePari}**, tirage : **${tirage}**.`;
        }
        break;
    }

    // Mise à jour de l'économie
    if (aGagné) {
      userEco.pièces += gain;
    } else {
      userEco.pièces -= mise;
      gain = -mise;
    }

    await userEco.save();

    // Embed final de résultat
    const resultEmbed = new EmbedBuilder()
      .setColor(aGagné ? "Green" : "Red")
      .setTitle("🎰 Résultat de la Roulette")
      .setDescription(
        `${details}\n\n${
          aGagné
            ? `🎉 Tu gagnes **${gain} pièces** !`
            : `😢 Tu perds **${Math.abs(gain)} pièces**.`
        }`
      )
      .setFooter({
        text: `Pari de ${mise} pièces - ${interaction.user.username}`,
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });
  },
};
