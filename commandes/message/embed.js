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
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Nécessite la permission de bannir

  async execute(interaction) {
    const channelId = "1356468520442921100"; // ID SALON

    const embed = new EmbedBuilder()
      .setTitle("Tenmo de retour ?? !! ! ??")
      .setDescription(
        "Bonjour ou bonsoir mes champignons, en effet, c'est le retour du royal Tenmo. Discutons-en"
      )
      .addFields(
        {
          name: "Capitaine  au rapport",
          value:
            "J'aime bcp bcp Tenmo et ne souhaite pas qu'il disparaisse. Maintenant que je suis loin de la tempête je profite du calme pour le récupérer mais beaucoup de choses vont changer. \nJe pense arrêter l'idée de saisons pour Tenmo, de prestige etc... Le système d'économie sera là pour s'amuser, je ferai des ajouts etc selon vos goûts et idées mais sans nerf ou buff pour complaire une saison. Donc là par exemple la roulette, le blackjack et les machines à sous (toutes neuves) sont normales, pareil pour la pêche tout est cool soyez riche.",
          inline: false,
        },
        {
          name: "Le futur du capitaine ?",
          value:
            "Même si les projets  énormes sont terminés, c'est-à-dire que j'ai supprimé tout en lien avec les entreprises (trop trop mal de tête ça), les pets restent, même si je vais les rework petit à petit, pareil pour le reste.\nLe nouveau but de Tenmo est d'être léger MAIS amusant. Donc y'aura des commandes comme les films, la roulette... Mais pas de trucs pour vous contraindre sauf le forcekick à un million d'accord.\nConcernant les pets, ce sera juste de la collection pure (ou vendre) sans pouvoirs, juste j'essaierai d'ajouter une quantité énorme pour que vous soyez content de les collecter malgré leur rareté ! \n\nBisou",
          inline: false,
        }
      )
      .setImage(
        "https://media1.tenor.com/m/tjynp4QoWd8AAAAC/minecraft-mr-bis-tom-nook-dies.gif"
      )
      .setColor("#0c98cf")
      .setFooter({
        text: "C'est super tout ça",
      });

    // Récupérer le salon avec l'ID et envoyer l'embed
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
