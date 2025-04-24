const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");
const LeaderboardTresor = require("../../Sequelize/modèles/argent/treasureleaderboard");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trésor")
    .setDescription("Part à la chasse au trésor et tente ta chance !")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("jouer")
        .setDescription("Tente de trouver un trésor !")
        .addIntegerOption((option) =>
          option
            .setName("mise")
            .setDescription("Montant à parier pour la chasse")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("leaderboard")
        .setDescription("Classement des meilleurs chasseurs")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "leaderboard") {
      const topPlayers = await LeaderboardTresor.findAll({
        order: [["totalGains", "DESC"]],
        limit: 10,
      });

      const embed = new EmbedBuilder()
        .setTitle("🏆 Leaderboard - Chasseurs de trésor")
        .setColor("Gold")
        .setDescription(
          topPlayers.length
            ? topPlayers
                .map(
                  (user, index) =>
                    `${index + 1}. **${user.username}** - 💰 ${
                      user.totalGains
                    } pièces (🎯 ${user.chassesEffectuées} chasses)`
                )
                .join("\n")
            : "Aucun aventurier en tête pour l'instant. Lance-toi dans la chasse !"
        );

      return interaction.reply({ embeds: [embed] });
    }

    const mise = interaction.options.getInteger("mise");
    const userId = interaction.user.id;
    const user = await Economie.findByPk(userId);

    if (!user || user.pièces < mise) {
      return interaction.reply(
        "❌ Tu n'as pas assez de pièces pour parier ce montant !"
      );
    }

    user.pièces -= mise; // La mise est retirée du solde de l'utilisateur
    await user.save();

    // Dimensions de la carte
    const mapSize = 4; // Carte de 4x4 (les coordonnées seront de 1 à 4)
    const map = Array(mapSize)
      .fill(null)
      .map(() => Array(mapSize).fill(" ")); // Carte vide au départ

    // Placer aléatoirement les trésors et pièges
    const treasuresCount = 2; // Nombre de trésors
    const trapsCount = 2; // Nombre de pièges

    // Placer les trésors (cases cachées derrière des diamants)
    let treasures = [];
    for (let i = 0; i < treasuresCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * mapSize);
        y = Math.floor(Math.random() * mapSize);
      } while (map[x][y] !== " "); // S'assurer qu'on ne place pas un trésor sur une case déjà occupée
      map[x][y] = "T"; // Marque la position du trésor
      treasures.push({ x, y });
    }

    // Placer les pièges (cases cachées derrière des diamants)
    let traps = [];
    for (let i = 0; i < trapsCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * mapSize);
        y = Math.floor(Math.random() * mapSize);
      } while (map[x][y] !== " "); // S'assurer qu'on ne place pas un piège sur une case déjà occupée
      map[x][y] = "P"; // Marque la position du piège
      traps.push({ x, y });
    }

    // Définir l'emoji de la carte (seul le bot sait si c'est un trésor ou un piège)
    const treasureTile = "💎"; // Les trésors ET les pièges utilisent ce même emoji

    // Créer la carte (grille de jeu)
    let mapEmbed = new EmbedBuilder()
      .setTitle("🌍 Carte du Désert")
      .setColor("Orange")
      .setDescription("Explore la carte et trouve les trésors !");

    // Affichage de la grille (sable et emojis de diamant pour les trésors/pièges)
    let gridDisplay = "";
    for (let i = 0; i < mapSize; i++) {
      let row = "";
      for (let j = 0; j < mapSize; j++) {
        if (map[i][j] === "T" || map[i][j] === "P") {
          row += `[${treasureTile}] `; // Afficher un diamant pour les trésors et pièges
        } else {
          row += "[🏜️] "; // Sable pour les autres cases
        }
      }
      gridDisplay += row + "\n";
    }

    // Ajouter la grille à l'embed
    mapEmbed.addFields({
      name: "Grille du Désert",
      value: gridDisplay,
      inline: false,
    });

    await interaction.reply({ embeds: [mapEmbed] });

    // Demander à l'utilisateur de choisir des coordonnées
    const promptEmbed = new EmbedBuilder()
      .setTitle("📍 Choisis tes coordonnées")
      .setDescription(
        "Quel emplacement veux-tu explorer ? (Format : x,y, où x et y sont des entiers entre 1 et 4)"
      )
      .setColor("Yellow");

    await interaction.followUp({ embeds: [promptEmbed] });

    // Attente de la réponse de l'utilisateur
    const filter = (msg) =>
      msg.author.id === interaction.user.id && /^(\d),(\d)$/.test(msg.content); // Format des coordonnées : x,y

    try {
      const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 200000, // Temps de réponse de 3 minutes et 20 secondes
        errors: ["time"],
      });

      const input = collected.first().content;
      let [x, y] = input.split(",").map(Number);

      // Convertir les coordonnées utilisateur de 1-4 à 0-3
      x -= 1;
      y -= 1;

      // Vérification si les coordonnées sont valides
      if (
        isNaN(x) ||
        isNaN(y) ||
        x < 0 ||
        y < 0 ||
        x >= mapSize ||
        y >= mapSize
      ) {
        return interaction.followUp(
          "❌ Coordonnées invalides ! Le jeu s'arrête. Tu as perdu !"
        );
      }

      // Vérification si l'utilisateur a trouvé un trésor ou un piège
      let resultEmbed = new EmbedBuilder().setColor("Orange");

      if (treasures.some((t) => t.x === x && t.y === y)) {
        // Trésor trouvé
        const gain = mise * Math.floor(Math.random() * 2 + 2);
        user.pièces += gain;
        await user.save();

        resultEmbed
          .setTitle("🎉 Trésor trouvé !")
          .setDescription(
            `Tu as trouvé un trésor à (${x + 1}, ${
              y + 1
            }) ! 💰\nTu gagnes **${gain} pièces**.`
          );
      } else if (traps.some((t) => t.x === x && t.y === y)) {
        // Piège déclenché
        const perte =
          mise + Math.floor(Math.random() * mise * 0.5 + mise * 0.2);
        user.pièces -= perte;
        await user.save();

        resultEmbed
          .setTitle("💥 Piège déclenché !")
          .setDescription(
            `Tu es tombé dans un piège à (${x + 1}, ${
              y + 1
            }) ! 😱\nTu perds **${perte} pièces**.`
          );
      } else {
        // Rien trouvé
        user.pièces -= mise;
        await user.save();

        resultEmbed
          .setTitle("🪙 Rien trouvé...")
          .setDescription(
            `Tu n'as rien trouvé à (${x + 1}, ${
              y + 1
            }), mais tu perds ta mise de **${mise} pièces**.`
          );
      }

      await interaction.followUp({ embeds: [resultEmbed] });
    } catch (err) {
      return interaction.followUp("⏳ Temps écoulé, tu as perdu !");
    }
  },
};
