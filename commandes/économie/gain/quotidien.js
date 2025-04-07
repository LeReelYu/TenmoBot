const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const daily = require("../../../Sequelize/modèles/argent/daily");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Réclame ton argent quotidien !"),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Vérifier si l'utilisateur a réclamé son argent aujourd'hui
    let lastClaim = await daily.findOne({ where: { userId: userId } });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    let lastClaimedTime = "Jamais"; // Valeur par défaut si l'utilisateur n'a jamais réclamé

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

    // Chance de 1/10000 d'obtenir 1000 pièces
    let randomAmount;
    let isSpecialReward = false;
    if (Math.random() < 0.0001) {
      randomAmount = 1000; // 1/10000 chance d'obtenir 1000 pièces
      isSpecialReward = true; // Marquer ce cas comme spécial
    } else {
      randomAmount = Math.floor(Math.random() * 250) + 1; // Sinon entre 1 et 250 pièces
    }

    // Ajouter des pièces à l'utilisateur
    const user = await Economie.findOne({ where: { userId: userId } });

    if (user) {
      user.pièces += randomAmount;
      await user.save();
    } else {
      return interaction.reply(
        "Tu n'as pas encore de compte. Crée-en un avant de réclamer ton daily !"
      );
    }

    // Sauvegarder l'heure de la dernière réclamation
    if (lastClaim) {
      lastClaim.lastClaimed = now;
      await lastClaim.save();
    } else {
      await daily.create({ userId: userId, lastClaimed: now });
    }

    // Créer l'embed de réponse
    let embed;
    if (isSpecialReward) {
      embed = new EmbedBuilder()
        .setTitle(`🎉 Félicitations ${interaction.user.username}!`)
        .setDescription(
          `Tu as eu la chance incroyable de recevoir **1000 pièces** d'un coup ! 🥳💰`
        )
        .setColor("GOLD") // Embedding doré pour la récompense spéciale
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
