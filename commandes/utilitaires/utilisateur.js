const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infoutilisateur")
    .setDescription("Affiche les informations d'un membre.")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre dont vous voulez voir les informations.")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Récupérer l'utilisateur mentionné
    const membre = interaction.options.getMember("membre");

    // Vérification que le membre est bien présent dans le serveur
    if (!membre) {
      return interaction.reply({
        content: "Je n'ai pas pu trouver ce membre sur le serveur.",
        ephemeral: true,
      });
    }

    // Récupérer la date de création du compte et d'arrivée sur le serveur
    const creationDate = `<t:${Math.floor(
      membre.user.createdTimestamp / 1000
    )}:F>`;
    const joinDate = `<t:${Math.floor(membre.joinedTimestamp / 1000)}:F>`;

    // Construire l'embed
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`📋 Informations sur ${membre.user.tag}`)
      .setThumbnail(membre.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "🆔 Identifiant", value: membre.user.id, inline: true },
        { name: "📅 Compte créé le", value: creationDate, inline: true },
        { name: "🚪 Arrivée sur le serveur le", value: joinDate, inline: true }
      )
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    // Envoyer la réponse
    return interaction.reply({ embeds: [embed] });
  },
};
