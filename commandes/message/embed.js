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
    const channelId = "1332377646725857280"; // Remplace par l'ID du salon où tu veux envoyer l'embed

    const embed = new EmbedBuilder()
      .setTitle("- La Gazette du Lagon #1")
      .addFields(
        {
          name: "Kesesé la gazette et le TEEMONEWS???",
          value:
            "Bonjour à tous mes petits scouts à en devenir !! ! J'espère que vous allez bien... Sinon **soyez le** je sais pas?\nBon vous l'avez vu mais il y a déjà eu une annonce plus tôt aujourd'hui et si vous êtes bêtes cliquez [ici](https://discord.com/channels/1332345878094287009/1332377646725857280/1356118242380349451).\nPour faire simple, tout relatif aux **champignons** seront liés aux **TEEMONEWS** et celui qui les maintient c'est à dire <@623896311871176725>  alors que les autres annonces du serveur ou tout ce qui touche aux **pièces** ce sera ici dans la **gazette** et géré en majorité par moi (je crois?)",
          inline: false,
        },
        {
          name: "Vrai contenu de la gazette du jour",
          value:
            "Maintenant que ça a été dit voilà le plus important pour la gazette du jour. Comme vous le savez notre serveur a été béni par la présence du TenmoBot, c'est même lui qui écrit ce message en ce moment comme le soumis qu'il est. \nCe bot possède beaucoup de fonctionnalités certes mais **vous** pouvez contribuer à le rendre meilleur ! \nEn effet, toute [suggestion](https://discord.com/channels/1332345878094287009/1332385635847110800) est appréciée pour un ajout de commande, une rectification de son comportement... Vous avez une réelle influence !",
          inline: true,
        },
        {
          name: "L'arrivée de l'économie",
          value:
            "Enfin, la grande avancée du bot est l'apparition de sa monnaie que vous pouvez tous essayer dans le salon [adéquat](https://discord.com/channels/1332345878094287009/1332381115067142165) ! \nNotre monnaie est donc divisée en **champignons** (monnaie très rare des events, échangeables dans de rares occasions contre de **GROS** prix)\nEt les **pièces** (monnaie plus **classique** mais qui peut néanmoins vous intéresser)\nJe ne suis personne pour dicter l'utilité des champignons **cependant** pour les pièces je fais appel à **vous** ! Donnez également vos idées pour le bot dans la façon de gagner des pièces mais aussi de les dépenser !!! \n\n\nAh et aussi si vous finissez sur la paille sachez que c'est Tom Nook qui gère donc je peux rien y faire.\n\nBonne journée mes petits champignons vénéneux et purulents... Vous voyez le salon menu aussi alors plus d'excuses \n\n||<@&1356116235342971022> ||",
          inline: false,
        }
      )
      .setImage(
        "https://media0.giphy.com/media/dwAKRfxu3kxB12HFmW/giphy-downsized.gif"
      )
      .setThumbnail(
        "https://media0.giphy.com/media/UVvQSj6iycpxdemSyY/giphy.gif?cid=6c09b9527nf2nhz9k2xm9hdnlin4cyu2o637arfe5zea4gky&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g"
      )
      .setColor("#3da81f")
      .setFooter({
        text: "Yu",
        iconURL:
          "https://cdn.discordapp.com/avatars/260419988563689472/5afd454bebb1ab70af0cb1c82609ffdf.webp?size=1024",
      })
      .setTimestamp();

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
