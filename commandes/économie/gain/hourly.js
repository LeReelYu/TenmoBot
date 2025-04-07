const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const Hourly = require("../../../Sequelize/modèles/argent/cdhourly");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hourly")
    .setDescription("Réclame une petite somme d'argent chaque heure !"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();
    const oneHour = 60 * 60 * 1000; // 1 heure en millisecondes

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

    // Chance de 90 % de succès
    if (Math.random() > 0.9) {
      return interaction.reply(
        "❌ Tu n'as pas eu de chance cette fois-ci, réessaie plus tard !"
      );
    }

    // Chance de 1/1000 d'obtenir 250 pièces d'un coup
    let randomAmount;
    let isSpecialReward = false;
    if (Math.random() < 0.001) {
      randomAmount = 250; // 1/1000 chance d'obtenir 250 pièces
      isSpecialReward = true; // Marquer ce cas comme spécial
    } else {
      randomAmount = Math.floor(Math.random() * 51); // Sinon entre 0 et 50 pièces
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

    // Sauvegarder l'heure de la dernière réclamation
    if (lastClaim) {
      lastClaim.lastClaimed = now;
      await lastClaim.save();
    } else {
      await Hourly.create({ userId: userId, lastClaimed: now });
    }

    // Créer l'embed de réponse
    let embed;
    if (isSpecialReward) {
      embed = new EmbedBuilder()
        .setTitle(`🎉 Félicitations ${interaction.user.username}!`)
        .setDescription(
          `Tu as eu la chance incroyable de recevoir **250 pièces** d'un coup ! 🥳💰`
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
