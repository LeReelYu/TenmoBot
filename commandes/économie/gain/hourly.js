const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const Hourly = require("../../../Sequelize/modèles/argent/cooldowns/cdhourly");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hourly")
    .setDescription("Réclame une petite somme d'argent chaque heure !"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();
    const oneHour = 60 * 60 * 1000;

    let lastClaim = await Hourly.findOne({ where: { userId: userId } });
    let lastClaimedTime = "Jamais";

    if (lastClaim) {
      lastClaimedTime = new Date(lastClaim.lastClaimed).toLocaleString(
        "fr-FR",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

      const lastClaimDate = new Date(lastClaim.lastClaimed);
      const timeRemaining = oneHour - (now - lastClaimDate);

      if (timeRemaining > 0) {
        const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        return interaction.reply(
          `⏳ Tu dois encore attendre **${minutes} minutes et ${seconds} secondes** avant de réclamer ta récompense horaire !`
        );
      }
    }

    // Calcul du gain
    let randomAmount;
    let isSpecialReward = false;

    // Chance de 1% d'obtenir 450 pièces
    if (Math.random() < 0.01) {
      randomAmount = 450;
      isSpecialReward = true;
    } else {
      randomAmount = Math.floor(Math.random() * 51) + 30; // 30 à 80
    }

    const user = await Economie.findOne({ where: { userId: userId } });

    if (user) {
      user.pièces += randomAmount;
      await user.save();
    } else {
      return interaction.reply(
        "Tu n'as pas encore de compte. Crée-en un avant de réclamer ta récompense horaire !"
      );
    }

    if (lastClaim) {
      lastClaim.lastClaimed = now;
      await lastClaim.save();
    } else {
      await Hourly.create({ userId: userId, lastClaimed: now });
    }

    let embed;
    if (isSpecialReward) {
      embed = new EmbedBuilder()
        .setTitle(`🎉 Félicitations ${interaction.user.username}!`)
        .setDescription(
          `Tu as eu la chance incroyable de recevoir **450 pièces** d'un coup ! 🥳💰`
        )
        .setColor("GOLD")
        .setFooter({
          text: "Tom Nook",
          iconURL:
            "https://pbs.twimg.com/profile_images/1280368407586594817/bUqZkDDU_400x400.jpg",
        })
        .setTimestamp();
    } else {
      embed = new EmbedBuilder()
        .setTitle(`Récompense horaire de ${interaction.user.username}`)
        .addFields(
          {
            name: "💰 Pièces reçues",
            value: `Tu as gagné **${randomAmount}** pièces !`,
            inline: true,
          },
          {
            name: "🕰️ Dernière réclamation",
            value: lastClaimedTime,
            inline: false,
          }
        )
        .setColor("#00b0f4")
        .setFooter({
          text: "Tom Nook",
          iconURL:
            "https://pbs.twimg.com/profile_images/1280368407586594817/bUqZkDDU_400x400.jpg",
        })
        .setTimestamp();
    }

    await interaction.reply({ embeds: [embed] });
  },
};
