const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const Prestige = require("../../../Sequelize/modèles/prestige");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("solde")
    .setDescription("Affiche le solde du compte choisi")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("L'utilisateur dont vous voulez voir le solde")
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser =
      interaction.options.getUser("utilisateur") || interaction.user;

    const user = await Economie.findOne({
      where: { userId: targetUser.id },
    });

    const prestige = await Prestige.findOne({
      where: { userId: targetUser.id },
    });

    if (user) {
      const phrases = [
        "Temmie et ici par volonter",
        "Tu es riche comme un roi des îles",
        "Ma famille me manque...",
        "hOIIIII",
        "jador Tenmo!!!",
        "aWWWWWaaa",
        "AWA",
        "hOI!!!!!! JE SUI tEMMIE!!",
        "GRO FcUL",
        "TU ET TRO MIMIIII",
        "OOOOooo tu et rich",
        "Narval est gay",
        "cherche plan fentanyl",
        "jador travail",
        "o rat port",
      ];

      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Solde bancaire de ${targetUser.username}`)
        .addFields(
          {
            name: "Nombre de champignons",
            value: `Ce compte contient actuellement ${user.champignons} <:champignon:1357248272280064070> champignons !`,
            inline: true,
          },
          {
            name: "Nombre de pièces",
            value: `Ce compte contient actuellement ${user.pièces} <:bouee:1357248291238318273> pièces !`,
            inline: true,
          },
          {
            name: "🏆 Prestige",
            value: `Ce compte possède actuellement ${
              prestige ? prestige.prestige : 0
            } points de prestige !`,
            inline: true,
          },
          {
            name: "Message ULTRA important de Temmie",
            value: randomPhrase,
            inline: false,
          }
        )
        .setImage(
          "https://i.pinimg.com/originals/15/e1/5a/15e15a4882de568ffdf6b454044e2903.gif"
        )
        .setColor(getRandomColor())
        .setFooter({
          text: "Capitaine Tenmo",
          iconURL:
            "https://cdn.discordapp.com/avatars/1351617570180173925/7cbc961c96f1f701f276bdf80737affd.webp?size=1024",
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply(
        `${targetUser.username} n'a pas encore de compte au lagon !`
      );
    }
  },
};
