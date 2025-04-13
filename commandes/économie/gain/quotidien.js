const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const daily = require("../../../Sequelize/modèles/argent/cooldowns/daily");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Réclame ton argent quotidien !"),

  async execute(interaction) {
    const userId = interaction.user.id;

    let lastClaim = await daily.findOne({ where: { userId: userId } });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

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

      if (new Date(lastClaim.lastClaimed) > yesterday) {
        return interaction.reply(
          `⏳ Tu as déjà réclamé ton daily aujourd'hui ! Reviens demain.\n📅 Dernière réclamation : **${lastClaimedTime}**`
        );
      }
    }

    // Chance de 1/12000 d'obtenir 3500 pièces
    let randomAmount;
    let isSpecialReward = false;

    if (Math.random() < 1 / 12000) {
      randomAmount = 3500;
      isSpecialReward = true;
    } else {
      randomAmount = Math.floor(Math.random() * 551) + 100; // 100 à 650
    }

    const user = await Economie.findOne({ where: { userId: userId } });

    if (user) {
      user.pièces += randomAmount;
      await user.save();
    } else {
      return interaction.reply(
        "Tu n'as pas encore de compte. Crée-en un avant de réclamer ton daily !"
      );
    }

    if (lastClaim) {
      lastClaim.lastClaimed = now;
      await lastClaim.save();
    } else {
      await daily.create({ userId: userId, lastClaimed: now });
    }

    let embed;
    if (isSpecialReward) {
      embed = new EmbedBuilder()
        .setTitle(`🎉 Félicitations ${interaction.user.username}!`)
        .setDescription(
          `Tu as eu la chance incroyable de recevoir **3500 pièces** d'un coup ! 🥳💰`
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
        .setTitle(`Récompense quotidienne de ${interaction.user.username}`)
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
