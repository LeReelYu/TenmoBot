const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infoserveur")
    .setDescription("Affiche les informations du serveur."),

  async execute(interaction) {
    const { guild } = interaction;

    // Récupération des informations sur le serveur
    const owner = await guild.fetchOwner(); // Récupère le propriétaire du serveur
    const creationDate = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
    const totalMembers = guild.memberCount;
    const totalChannels = guild.channels.cache.size;
    const totalRoles = guild.roles.cache.size;
    const boostCount = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;

    // Création de l'embed
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`📊 Informations sur le serveur ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "📌 Nom", value: guild.name, inline: true },
        { name: "🆔 ID", value: guild.id, inline: true },
        {
          name: "👑 Propriétaire",
          value: `${owner.user.tag} (${owner.user.id})`,
          inline: false,
        },
        { name: "📆 Créé le", value: creationDate, inline: true },
        { name: "👥 Membres", value: `${totalMembers} membres`, inline: true },
        { name: "💬 Salons", value: `${totalChannels} salons`, inline: true },
        { name: "🔖 Rôles", value: `${totalRoles} rôles`, inline: true },
        {
          name: "🚀 Boosts",
          value: `${boostCount} boosts (Niveau ${boostLevel})`,
          inline: true,
        }
      )
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    // Envoi de l'embed
    return interaction.reply({ embeds: [embed] });
  },
};
