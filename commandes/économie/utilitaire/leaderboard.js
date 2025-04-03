const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription(
      "Affiche le leaderboard des membres avec le plus de pièces"
    ),

  async execute(interaction) {
    // Récupérer les 10 utilisateurs avec le plus de pièces
    const leaderboard = await Economie.findAll({
      order: [["pièces", "DESC"]], // Trier par le nombre de pièces (du plus grand au plus petit)
      limit: 10, // Limiter à 10 utilisateurs
    });

    // Créer un tableau pour afficher les résultats
    let leaderboardMessage = "";
    leaderboard.forEach((user, index) => {
      leaderboardMessage += `**${index + 1}.** <@${user.userId}> - **${
        user.pièces
      } pièces**\n`;
    });

    // Fonction pour générer une couleur aléatoire valide
    const randomColor = () => {
      const color = Math.floor(Math.random() * 16777215).toString(16); // Génère un nombre hexadécimal
      return `#${color.padStart(6, "0")}`; // Ajoute des zéros si nécessaire pour obtenir une couleur valide
    };

    // Créer l'embed de réponse avec une couleur aléatoire
    const embed = new EmbedBuilder()
      .setTitle("Leaderboard des Pièces")
      .setDescription(
        leaderboardMessage || "Aucun utilisateur n'a encore de pièces."
      )
      .setColor(randomColor()) // Couleur aléatoire
      .setFooter({
        text: "Tom Nook",
        iconURL:
          "https://pbs.twimg.com/profile_images/1280368407586594817/bUqZkDDU_400x400.jpg",
      })
      .setTimestamp();

    // Envoyer l'embed
    await interaction.reply({ embeds: [embed] });
  },
};
