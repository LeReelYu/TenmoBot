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
      .setAuthor({
        name: "Teemo'news",
      })
      .setTitle("Le Premier Magasin")
      .setDescription(
        "comme vous le savais, le premier magasin a rejoindre le serveur n'est autre que...\n FootPorn'shop !!!!\net oui on se lance dans la collection panini de pied, payez vos boosters et priez pour avoir la carte ultra rare des pieds de damdam !\nmais pas que !  Il vas y avoir un jeu pour utiliser les carte, faites vos decks et combattez les autres avec votre carte pied de clochard !!!\n\nbientôt disponible !!"
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/969658744692682762/1356347494317035721/le_1er_magasin.png?ex=67ece54a&is=67eb93ca&hm=aeddf0c808c6b8db5383fff00c2c7c658dc38f3085acf8b3354fd6cdb37cec94&"
      )
      .setColor("#00b0f4")
      .setFooter({
        text: "ratatoing",
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
