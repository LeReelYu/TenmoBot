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
        .setTitle("\ud83c\udfc6 Leaderboard - Chasseurs de trésor")
        .setColor("Gold")
        .setDescription(
          topPlayers.length
            ? topPlayers
                .map(
                  (user, index) =>
                    `${index + 1}. **${user.username}** - \ud83d\udcb0 ${
                      user.totalGains
                    } pièces (\ud83c\udfaf ${user.chassesEffectuées} chasses)`
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

    user.pièces -= mise;
    await user.save();

    const mapSize = 4;
    const map = Array(mapSize)
      .fill(null)
      .map(() => Array(mapSize).fill(" "));

    const treasuresCount = 2;
    const trapsCount = 2;

    let treasures = [];
    for (let i = 0; i < treasuresCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * mapSize);
        y = Math.floor(Math.random() * mapSize);
      } while (map[x][y] !== " ");
      map[x][y] = "T";
      treasures.push({ x, y });
    }

    let traps = [];
    for (let i = 0; i < trapsCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * mapSize);
        y = Math.floor(Math.random() * mapSize);
      } while (map[x][y] !== " ");
      map[x][y] = "P";
      traps.push({ x, y });
    }

    const generateGrid = (treasures, traps, mapSize, lockedTreasure) => {
      let grid = "";
      for (let i = 0; i < mapSize; i++) {
        let row = "";
        for (let j = 0; j < mapSize; j++) {
          if (lockedTreasure.some((t) => t.x === i && t.y === j)) {
            row += "[💎] ";
          } else if (traps.some((t) => t.x === i && t.y === j)) {
            row += "[💎] ";
          } else {
            row += "[🏜️] ";
          }
        }
        grid += row + "\n";
      }
      return grid;
    };

    let mapEmbed = new EmbedBuilder()
      .setTitle("🌍 Carte du Désert")
      .setColor("Orange")
      .setDescription("Explore la carte et trouve les trésors !")
      .addFields({
        name: "Grille du Désert",
        value: generateGrid(treasures, traps, mapSize, treasures),
        inline: false,
      });

    await interaction.reply({ embeds: [mapEmbed] });

    for (let t = 0; t < 4; t++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      traps = traps.map(() => {
        let newX, newY;
        do {
          newX = Math.floor(Math.random() * mapSize);
          newY = Math.floor(Math.random() * mapSize);
        } while (treasures.some((t) => t.x === newX && t.y === newY));
        return { x: newX, y: newY };
      });

      const movingEmbed = new EmbedBuilder()
        .setTitle("🌪️ Le désert bouge...")
        .setColor("Orange")
        .setDescription(
          "Les mirages changent de place... Trouveras-tu le bon diamant ?"
        )
        .addFields({
          name: "Grille mouvante",
          value: generateGrid(treasures, traps, mapSize, treasures),
          inline: false,
        });

      await interaction.followUp({ embeds: [movingEmbed] });
    }

    const promptEmbed = new EmbedBuilder()
      .setTitle("📍 Choisis tes coordonnées")
      .setDescription(
        "Quel emplacement veux-tu explorer ? (Format : ligne, colonne où les chiffres sont entre 1 et 4 / Ex: 1,2)"
      )
      .setColor("Yellow");

    await interaction.followUp({ embeds: [promptEmbed] });

    const filter = (msg) =>
      msg.author.id === interaction.user.id && /^\d,\d$/.test(msg.content);

    try {
      const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 200000,
        errors: ["time"],
      });

      const input = collected.first().content;
      let [x, y] = input.split(",").map(Number);
      x -= 1;
      y -= 1;

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

      let resultEmbed = new EmbedBuilder().setColor("Orange");

      if (treasures.some((t) => t.x === x && t.y === y)) {
        const gain = mise * Math.floor(Math.random() * 3 + 3);
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
        const perte = Math.floor(mise * (1.5 + Math.random()));
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
