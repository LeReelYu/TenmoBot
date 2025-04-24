const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

const activeFishingUsers = new Map();

const fishTiers = [
  {
    emoji: "🐠",
    name: "Poisson commun",
    multiplier: 1.0,
    chance: 0.7,
    isBad: false,
  },
  {
    emoji: "🐡",
    name: "Poisson rare",
    multiplier: 2.0,
    chance: 0.2,
    isBad: false,
  },
  {
    emoji: "🦈",
    name: "Requin légendaire",
    multiplier: 2.5,
    chance: 0.05,
    isBad: false,
  },
  {
    emoji: "🐋",
    name: "Le Léviathan",
    multiplier: 3.0,
    chance: 0.02,
    isBad: false,
  },
  {
    emoji: "💀",
    name: "Poisson mauvais",
    multiplier: 0,
    chance: 0.025,
    isBad: true,
  }, // Poisson mauvais
  {
    emoji: "🦑",
    name: "Calamar maléfique",
    multiplier: 0,
    chance: 0.025,
    isBad: true,
  }, // Poisson mauvais
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("peche")
    .setDescription("Lance une session de pêche !")
    .addStringOption((option) =>
      option
        .setName("mise")
        .setDescription("Choisissez la mise que vous voulez parier (ou 'all')")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    if (activeFishingUsers.has(userId)) {
      return interaction.reply({
        content: "⏳ Tu es déjà en train de pêcher !",
      });
    }

    const betOption = interaction.options.getString("mise");
    const userEconomy = await Economie.findOne({ where: { userId } });
    if (!userEconomy || userEconomy.pièces <= 0) {
      return interaction.reply("❌ Tu n'as pas d'argent pour pêcher.");
    }

    let betAmount =
      betOption === "all" ? userEconomy.pièces : parseInt(betOption);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > userEconomy.pièces) {
      return interaction.reply("❌ Mise invalide ou insuffisante.");
    }

    activeFishingUsers.set(userId, true);

    const gridSize = 7;
    const messages = [
      "Quelle belle journée pour pêcher !",
      "Les poissons sont joueurs aujourd'hui !",
      "Un bon pêcheur est patient...",
    ];

    const generateSea = () => {
      const water = "🟦";
      const bottom = ["🪸", "🌿"];
      let sea = "";
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          sea +=
            i === gridSize - 1 && Math.random() < 0.3
              ? bottom[Math.floor(Math.random() * bottom.length)]
              : Math.random() < 0.85
              ? water
              : Math.random() < 0.5
              ? fishTiers[Math.floor(Math.random() * fishTiers.length)].emoji
              : fishTiers[0].emoji;
        }
        sea += "\n";
      }
      return sea;
    };

    let embed = new EmbedBuilder()
      .setTitle("🎣 Pêche en cours...")
      .setDescription(generateSea())
      .setColor("Blue");

    let message = await interaction.reply({
      content: `${
        messages[Math.floor(Math.random() * messages.length)]
      }\n\n*Réagis vite quand tu vois un poisson !*`,
      embeds: [embed],
    });

    message = await interaction.fetchReply();

    const interval = setInterval(() => {
      embed.setDescription(generateSea());
      message.edit({ embeds: [embed] });
    }, 5000);

    await message.react("💧");

    let reacted = false;
    const isFishingSuccessful = Math.random() < 0.55;

    setTimeout(async () => {
      if (!isFishingSuccessful) {
        clearInterval(interval);
        activeFishingUsers.delete(userId);
        userEconomy.pièces -= betAmount;
        await userEconomy.save();
        return message.edit({
          content: "La pêche a échoué... 😢 Tu perds ta mise.",
          embeds: [],
        });
      }

      const chosenFish = chooseFish();

      await message.reactions.removeAll();
      await message.react(chosenFish.emoji);

      const filter = (reaction, user) =>
        reaction.emoji.name === chosenFish.emoji && user.id === userId;
      const collector = message.createReactionCollector({
        filter,
        time: 3000,
        max: 1,
      });

      collector.on("collect", async (reaction) => {
        reacted = true;
        clearInterval(interval);

        if (chosenFish.isBad) {
          userEconomy.pièces -= betAmount;
          await userEconomy.save();
          return message.edit({
            content: `❌ Oh non ! Tu as attrapé **${chosenFish.name}** ${chosenFish.emoji}, tu perds ta mise de **${betAmount} pièces**.`,
            embeds: [],
          });
        }

        const gain = Math.floor(betAmount * chosenFish.multiplier);
        userEconomy.pièces += gain;
        await userEconomy.save();

        await message.edit({
          content: `🎉 Tu as attrapé **${chosenFish.name}** ${chosenFish.emoji} et gagné **${gain} pièces** !`,
          embeds: [],
        });

        activeFishingUsers.delete(userId);
      });

      collector.on("end", async () => {
        if (!reacted) {
          clearInterval(interval);
          activeFishingUsers.delete(userId);
          userEconomy.pièces += betAmount;
          await userEconomy.save();

          await message.edit({
            content: `Tu n'as pas réagi à temps, mais tu récupères ta mise de **${betAmount} pièces**.`,
            embeds: [],
          });
        }
      });
    }, Math.random() * 3000 + 1000);
  },
};

function chooseFish() {
  const roll = Math.random();
  let cumulative = 0;
  for (const fish of fishTiers) {
    cumulative += fish.chance;
    if (roll < cumulative) return fish;
  }
  return fishTiers[0];
}
