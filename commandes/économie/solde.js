const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("solde")
    .setDescription("Affiche le solde de ton compte"),

  async execute(interaction) {
    const user = await Economie.findOne({
      where: { userId: interaction.user.id },
    });
    if (user) {
      // Tableau de phrases pré-écrites
      const phrases = [
        "Temmie et ici par volonter",
        "Tu es riche comme un roi des îles",
        "Ma famille me manque...",
        "hOIIIII",
        "jador Tenmo!!!",
        "aWWWWWaaa",
        "AWA",
        "hOI!!!!!! JE SUI tEMMIE!!",
        "GRO FUL",
        "TU ET TRO MIMIIII",
      ];

      // Sélection d'une phrase aléatoire
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      // Fonction pour générer une couleur hexadécimale aléatoire
      function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Solde bancaire de ${interaction.user.username}`)
        .addFields(
          {
            name: "Nombre de champignons",
            value: `Ton compte contient actuellement ${user.champignons} champignons !`,
            inline: true,
          },
          {
            name: "Nombre de pièces",
            value: `Ton compte contient actuellement ${user.pièces} pièces !`,
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
        .setColor(getRandomColor()) // Utilisation de la couleur aléatoire
        .setFooter({
          text: "Capitaine Tenmo",
          iconURL:
            "https://cdn.discordapp.com/avatars/1351617570180173925/7cbc961c96f1f701f276bdf80737affd.webp?size=1024",
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply("Tu n'as pas encore de compte au lagon !");
    }
  },
};
