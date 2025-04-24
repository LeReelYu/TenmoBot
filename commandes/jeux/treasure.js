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

    user.pièces -= mise;
    await user.save();

    const mapSize = 4;

    const generateGrid = (displayedGems, mapSize) => {
      let grid = "";
      for (let i = 0; i < mapSize; i++) {
        let row = "";
        for (let j = 0; j < mapSize; j++) {
          if (displayedGems.some((t) => t.x === i && t.y === j)) {
            row += "[💎] ";
          } else {
            row += "[🏜️] ";
          }
        }
        grid += row + "\n";
      }
      return grid;
    };

    let treasureTarget;
    const map = Array(mapSize)
      .fill(null)
      .map(() => Array(mapSize).fill(" "));

    do {
      treasureTarget = {
        x: Math.floor(Math.random() * mapSize),
        y: Math.floor(Math.random() * mapSize),
      };
    } while (map[treasureTarget.x][treasureTarget.y] !== " ");

    const realTreasureMoves = [];
    while (realTreasureMoves.length < 2) {
      const rnd = Math.floor(Math.random() * 4);
      if (!realTreasureMoves.includes(rnd)) realTreasureMoves.push(rnd);
    }

    let gems = [];
    while (gems.length < 4) {
      const x = Math.floor(Math.random() * mapSize);
      const y = Math.floor(Math.random() * mapSize);
      if (!gems.some((g) => g.x === x && g.y === y)) {
        gems.push({ x, y });
      }
    }

    let startEmbed = new EmbedBuilder()
      .setTitle("🌍 Carte du Désert")
      .setColor("Orange")
      .setDescription("Voici les mirages qui brillent sous le soleil...")
      .addFields({
        name: "Grille initiale",
        value: generateGrid(gems, mapSize),
        inline: false,
      });

    await interaction.reply({ embeds: [startEmbed] });

    for (let t = 0; t < 4; t++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (realTreasureMoves.includes(t)) {
        const realGemIndex = Math.floor(Math.random() * gems.length);
        gems[realGemIndex] = { ...treasureTarget };
      } else {
        gems = gems.map(() => {
          let x, y;
          do {
            x = Math.floor(Math.random() * mapSize);
            y = Math.floor(Math.random() * mapSize);
          } while (
            (x === treasureTarget.x && y === treasureTarget.y) ||
            gems.some((g) => g.x === x && g.y === y)
          );
          return { x, y };
        });
      }

      const movingEmbed = new EmbedBuilder()
        .setTitle(`🌪️ Mirage ${t + 1}`)
        .setColor("Orange")
        .setDescription("Les joyaux scintillent à de nouveaux endroits...")
        .addFields({
          name: "Carte mouvante",
          value: generateGrid(gems, mapSize),
          inline: false,
        });

      await interaction.followUp({ embeds: [movingEmbed] });
    }

    const promptEmbed = new EmbedBuilder()
      .setTitle("📍 Choisis tes coordonnées")
      .setDescription(
        "Quel emplacement veux-tu explorer ? (Format : ligne,colonne entre 1 et 4 / ex : 1,3)"
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

      if (x === treasureTarget.x && y === treasureTarget.y) {
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
      } else {
        resultEmbed
          .setTitle("🪙 Rien trouvé...")
          .setDescription(
            `Tu n'as rien trouvé à (${x + 1}, ${
              y + 1
            }), ta mise de **${mise} pièces** est perdue.`
          );
      }

      await interaction.followUp({ embeds: [resultEmbed] });
    } catch (err) {
      return interaction.followUp("⏳ Temps écoulé, tu as perdu !");
    }
  },
};
