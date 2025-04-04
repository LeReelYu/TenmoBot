const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

// Map pour suivre les utilisateurs en train de pêcher
const activeFishingUsers = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("peche")
    .setDescription("Lance une session de pêche !")
    .addStringOption((option) =>
      option
        .setName("mise")
        .setDescription(
          "Choisissez la mise que vous voulez parier (ou 'all' pour tout miser)"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;

    if (activeFishingUsers.has(userId)) {
      return interaction.reply({
        content:
          "⏳ Tu es déjà en train de pêcher ! Attends que ta session se termine.",
      });
    }

    // Récupérer la mise de l'utilisateur
    const betOption = interaction.options.getString("mise");

    const userEconomy = await Economie.findOne({
      where: { userId: interaction.user.id },
    });

    if (!userEconomy || userEconomy.pièces <= 0) {
      return interaction.reply(
        "❌ Tu n'as pas d'argent pour pêcher. Gagne un peu de pièces avant de revenir !"
      );
    }

    let betAmount = 0;
    if (betOption === "all") {
      betAmount = userEconomy.pièces;
    } else {
      betAmount = parseInt(betOption);
    }

    if (isNaN(betAmount) || betAmount <= 0 || userEconomy.pièces < betAmount) {
      return interaction.reply(
        "❌ Tu n'as pas assez de pièces pour cette mise. Réessaie avec un montant plus petit."
      );
    }

    // Marque l'utilisateur comme en train de pêcher
    activeFishingUsers.set(userId, true);

    const messages = [
      "Quelle belle journée pour pêcher !",
      "Les poissons sont de sortie aujourd'hui !",
      "Un bon pêcheur sait être patient...",
      "Le calme avant la tempête ?",
      "Garde ton souffle !",
      "Ferme les yeux et pense à moi",
      "Est-ce que cette activité est imposable ?",
      "Tu devrais essayer d'avoir un vrai travail...",
      "Au rapport ! Comme ils disent...",
      "La mer est calme en ce moment",
      "Tu devrais me lire jusqu'au bout on sait jamais si je dis quelque chose de très important ? Par exemple aujourd'hui j'ai pêché pleins de poissons et j'espère honnêtement que toi aussi... Non je rigole j'espère que tu le rateras ça en fera plus pour moi",
      "Temmie a baisé ma femme...",
    ];

    const waterEmoji = "🟦";
    const fishEmojis = ["🐠", "🐟", "🐡"];
    const bottomEmojis = ["🪸", "🌿"];
    const gridSize = 7;

    function generateSea() {
      let sea = "";
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (i === gridSize - 1 && Math.random() < 0.3) {
            sea +=
              bottomEmojis[Math.floor(Math.random() * bottomEmojis.length)];
          } else {
            sea +=
              Math.random() < 0.85
                ? waterEmoji
                : fishEmojis[Math.floor(Math.random() * fishEmojis.length)];
          }
        }
        sea += "\n";
      }
      return sea;
    }

    let embed = new EmbedBuilder()
      .setTitle("🌊 Pêche en cours 🌊")
      .setDescription(generateSea())
      .setColor("Blue");

    let message = await interaction.reply({
      content: `${
        messages[Math.floor(Math.random() * messages.length)]
      }\n\n*Clique sur la réaction dès qu'elle devient un poisson pour gagner !*`,
      embeds: [embed],
    });
    message = await interaction.fetchReply();

    let interval;

    const stopEmbedUpdate = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    interval = setInterval(() => {
      embed.setDescription(generateSea());
      message.edit({ embeds: [embed] });
    }, 5000);

    let reactionCount = 0;
    let maxReactions = 5;
    let fishAppeared = false;
    let hasWon = false;
    let lost = false; // Indicateur pour savoir si l'utilisateur a perdu

    const isFishingSuccessful = Math.random() < 0.5;

    await message.react("💧");

    let reactionInterval = setInterval(async () => {
      if (reactionCount < maxReactions && !fishAppeared) {
        reactionCount++;
      }

      if (isFishingSuccessful && !fishAppeared) {
        setTimeout(async () => {
          const waterReaction = message.reactions.cache.get("💧");
          if (waterReaction) {
            await waterReaction.remove();
          }
          await message.react("🐟");

          fishAppeared = true;

          const filter = (reaction, user) =>
            reaction.emoji.name === "🐟" && user.id !== message.author.id;
          const collector = message.createReactionCollector({
            filter,
            time: 3000,
            max: 1,
          });

          collector.on("collect", async (reaction, user) => {
            try {
              const bonus = betAmount * 0.65;
              userEconomy.pièces += bonus;
              await userEconomy.save();

              await message.edit({
                content: `${user} a attrapé un poisson et gagne ${bonus} pièces ! 🏆`,
                embeds: [],
              });

              hasWon = true;
              activeFishingUsers.delete(userId);
              stopEmbedUpdate();
            } catch (error) {
              console.error("Erreur lors de l'ajout des pièces :", error);
              interaction.followUp(
                "Une erreur est survenue en ajoutant les pièces."
              );
              activeFishingUsers.delete(userId);
            }
          });

          setTimeout(async () => {
            if (!hasWon && fishAppeared) {
              await message.edit({
                content:
                  "La pêche a été infructueuse... 😢 Vous avez perdu votre mise.",
                embeds: [],
              });

              const fishReaction = message.reactions.cache.get("🐟");
              if (fishReaction) {
                await fishReaction.remove();
              }

              // Ne soustraire la mise que si l'utilisateur a perdu
              if (!hasWon && !lost) {
                lost = true; // Marquer que l'utilisateur a perdu
                userEconomy.pièces -= betAmount;
                await userEconomy.save();
              }

              activeFishingUsers.delete(userId);
              stopEmbedUpdate();
            }
          }, 2000);
        }, Math.random() * 3000 + 1000);
      }

      if (reactionCount >= maxReactions && !fishAppeared) {
        clearInterval(reactionInterval);
        clearInterval(interval);

        await message.edit({
          content:
            "La pêche a été infructueuse... 😢 Vous avez perdu votre mise.",
          embeds: [],
        });

        const fishReaction = message.reactions.cache.get("🐟");
        if (fishReaction) {
          await fishReaction.remove();
        }

        // Ne soustraire la mise que si l'utilisateur a perdu
        if (!hasWon && !lost) {
          lost = true; // Marquer que l'utilisateur a perdu
          userEconomy.pièces -= betAmount;
          await userEconomy.save();
        }

        activeFishingUsers.delete(userId);
        stopEmbedUpdate();
      }
    }, 3000);
  },
};
