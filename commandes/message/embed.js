const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Envoie un embed prédéfini dans un salon spécifique.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const channelId = "1356468520442921100";

    const embed = new EmbedBuilder()
      .setTitle("TenmoUpdate")
      .setDescription(
        "Coucou mes champignongues, tenmo fait peau neuve aujourd'hui"
      )
      .addFields(
        {
          name: "Ajout des champignons",
          value:
            "Vous pouvez à présent tous placer des champignons sur le serveur à l'aide de la commande **/shroom** (une fois par 24h) piégeant ainsi le salon ! \nSi une personne parle sur un salon piégé le champignon **explose** ! Supprimant son message et accordant de l'expérience au poseur\nChaque semaine, **le meilleur scout est ainsi élu** et le compteur est remis à zéro\nVous pouvez cependant vous **défendre** avec la commande **/déminage** vous accordant aussi de l'XP. Mais attention ! Si vous déminez un salon vide, vous ne pourrez plus poser de champignons pour **la semaine**",
          inline: false,
        },
        {
          name: "L'arrivée des notes",
          value:
            "Une commande **/note** vous permet de créer, modifier, lire, lister ou supprimer des notes personnalisées ne pouvant être lues que par vous si jamais vous avez envie de stocker des idées etc... Cela vous sert ainsi de **pense-bête**",
          inline: false,
        },
        {
          name: "Le rework des confessions",
          value:
            "La commande **/confess** change un peu. A présent, vous pouvez choisir soit de faire une blague, soit de vent/sérieux, soit de répondre à un sondage de façon anonyme",
          inline: false,
        },
        {
          name: "L'ajout de la boîte à rêve V2",
          value:
            "Avec la commande **/dream** vous pouvez partager vos rêves **et** cauchemar en étant anonyme **ou non**",
          inline: false,
        }
      )
      .setColor("#62f500");

    const channel = await interaction.client.channels.fetch(channelId);

    if (channel) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: "Embed envoyé dans le salon spécifié !",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Salon introuvable.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
