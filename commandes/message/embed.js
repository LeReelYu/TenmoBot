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
      .setAuthor({ name: "TEEMO'NEWS" })
      .setTitle("Récompense à venir")
      .addFields(
        {
          name: "Bonjour à toutes et à tous,",
          value:
            "Le serveur aux îles paradisiaques devient de plus en plus populaire et attire de plus en plus de monde !\nNous avons reçu de nombreuses demandes pour commercer !\nNous avons donc décidé d'accueillir une zone marchande au sein de notre archipel !",
          inline: false,
        },
        {
          name: "Mais comment marchander sans monnaie ?",
          value:
            "En effet, bons capitalistes que vous êtes, vous devez certainement vous poser la question !\n\nLa monnaie sera... des champignons 🍄 !\nNotre cher ami TenmoBot vous en donnera si vous participez à des événements avec mise.",
          inline: false,
        },
        {
          name: "À quoi ça va nous servir ?",
          value:
            "Comment ?\nIl est vrai que cela semble logique pour moi, mais peut-être pas pour vous.\nCes champignons vous permettront de les échanger contre des marchandises en quantité limitée !",
          inline: false,
        },
        {
          name: "Quoi ? Tout le monde ne pourra pas obtenir ces récompenses ?",
          value:
            "Eh non ! Seuls les plus rapides et fortunés pourront s'acheter des objets rocambolesques.",
          inline: false,
        },
        {
          name: "À suivre...",
          value:
            "Les informations sur le contenu des objets à acheter et sur notre premier marchand vous seront dévoilées très prochainement !\nRestez à l'écoute !\n\n*MrRitche*",
          inline: false,
        }
      )
      .setColor("#0029f5")
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
