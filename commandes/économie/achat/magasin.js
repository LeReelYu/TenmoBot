const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Objets = require("../../../Sequelize/modèles/argent/objets");
const Economie = require("../../../Sequelize/modèles/argent/économie"); // Modèle de l'économie
const Inventaire = require("../../../Sequelize/modèles/argent/inventaire"); // Modèle de l'inventaire

// Liste de phrases aléatoires pour ajouter un peu de fun
const randomPhrases = [
  "Bonjour, je m'appelle Jade. Tu m'as appelée. Si tu veux un prêt, tu dois d'abord mettre en gage un bien de valeur équivalente. Ta dignité, tes sentiments, ou même ta vie. Qu'est-ce que tu as à me proposer en échange ?",
  "Tu te sens perdu/perdue ? Ne t'en fais pas, on peut parler de ce que tu veux.",
  "L'argent est la recette du bonheur. La meilleure façon de s'en servir est d'en donner à ceux qui en ont besoin. C'est pourquoi mon travail consiste à apporter du bonheur aux autres. C'est à la portée de tous... à condition d'en payer le prix.",
  "« Madame Bonajade » ? Ce n'est qu'une maigre contribution, pas de quoi en faire un plat. Toute bonne action est une transaction avec un prix caché, mais un véritable acte de gentillesse va bien au-delà de n'importe quel contrat.",
  "Il n'existe aucune méthode pour quantifier la valeur de toute chose, puisque les impressions et sentiments façonnent le jugement... C'est pourquoi pour les personnes au caractère noble, les faveurs sont la dette la plus onéreuse.",
  "Je ne vois aucun inconvénient à ce que les clients veuillent racheter les biens mis en gage après avoir réalisé leur souhait. Je leur propose simplement une nouvelle alternative, qui leur permettra d'aller encore plus loin, le tout à un prix dérisoire... Devine ce qu'ils finissent par choisir ?",
  "Un investissement n'est pas un acte de charité. Ne l'oublie pas.",
];

function getRandomPhrase() {
  return randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription(
      "Voir les articles disponibles dans la boutique et les acheter"
    ),

  async execute(interaction) {
    const items = await Objets.findAll();

    if (items.length === 0) {
      return interaction.reply(
        "La boutique Bonajade est pour le moment indisponible."
      );
    }

    // Embed modifié pour correspondre au style de Bonajade avec les nouvelles images et couleurs
    const shopEmbed = new EmbedBuilder()
      .setColor("#9b00ff") // Couleur pourpre pour l'embed
      .setTitle("Bienvenue dans la **Boutique Bonajade**")
      .setDescription(
        "Il y a des choses qui ne se mesurent pas en termes de prix..."
      )
      .addFields(
        items.map((item) => ({
          name: `${item.name} - ${item.price} pièces`,
          value: `Sélectionne cet objet pour l'acheter.`,
          inline: false,
        }))
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/1352351466328948786/1357209612801015808/jade-a-moment-among-the-stars-a-moment-among-the-stars.gif?ex=67ef5f73&is=67ee0df3&hm=9b5c9eefdcfe5eeba98c6e4208699f90bf643ab29971f8949091241175cc152a&"
      ) // Gif de Jade
      .setFooter({
        text: "Jade",
        iconURL:
          "https://www.pockettactics.com/wp-content/sites/pockettactics/2024/04/Honkai-Star-Rail-Jade.jpg", // Image du footer de Jade
      })
      .setTimestamp()
      .addFields({
        name: "Message de Mademoiselle",
        value: getRandomPhrase(), // Ajout d'une phrase aléatoire
        inline: false,
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_item")
      .setPlaceholder("Choisissez un article à acheter")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        items.map((item) => ({
          label: `${item.name} - ${item.price} pièces`,
          value: item.id.toString(),
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [shopEmbed],
      components: [row],
    });

    // Créer un filtre pour écouter uniquement les interactions de ce membre
    const filter = (i) => i.user.id === interaction.user.id;

    // Créer un collector pour écouter les interactions sur le message
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 12000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "select_item") {
        const itemId = i.values[0];
        const item = await Objets.findByPk(itemId);

        if (!item) {
          return i.reply({
            content: "Cet objet n'existe pas.",
          });
        }

        const confirmEmbed = new EmbedBuilder()
          .setColor("#ffcc00")
          .setTitle("Confirmation d'achat")
          .setDescription(
            `Es-tu sûr de vouloir acheter **${item.name}** pour **${item.price}** pièces ?`
          );

        const confirmButton = new ButtonBuilder()
          .setCustomId("confirm_purchase")
          .setLabel("Confirmer l'achat")
          .setStyle(ButtonStyle.Success);

        const rowConfirm = new ActionRowBuilder().addComponents(confirmButton);

        await i.update({
          embeds: [confirmEmbed],
          components: [rowConfirm],
        });

        const confirmCollector =
          interaction.channel.createMessageComponentCollector({
            filter,
            time: 10000,
          });

        confirmCollector.on("collect", async (confirmInteraction) => {
          if (confirmInteraction.customId === "confirm_purchase") {
            // Récupérer l'utilisateur depuis le modèle d'économie
            const userEconomy = await Economie.findOne({
              where: { userId: interaction.user.id },
            });

            // Si l'utilisateur n'a pas de compte économique ou si le solde est incorrect
            if (!userEconomy) {
              console.log("L'utilisateur n'a pas de compte économique.");
              return confirmInteraction.reply({
                content: "Tu n'as pas de compte... Comme c'est curieux",
                ephemeral: true,
              });
            }

            if (userEconomy.pièces < item.price) {
              const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Achat impossible")
                .setDescription(
                  "Tu n'as pas assez de pièces pour acheter cet objet."
                );

              await confirmInteraction.update({
                embeds: [errorEmbed],
                components: [],
              });
              return;
            }

            // Afficher le solde avant l'achat pour déboguer
            console.log(`Solde avant l'achat: ${userEconomy.pièces}`);

            // Retirer les pièces de l'utilisateur
            userEconomy.pièces -= item.price;

            // Vérification du solde après retrait
            console.log(`Solde après retrait: ${userEconomy.pièces}`);

            await userEconomy.save();

            // Ajouter l'objet à l'inventaire
            await Inventaire.create({
              userId: interaction.user.id, // On utilise l'ID de l'utilisateur pour l'inventaire
              itemId: item.id,
            });

            // Embed de succès avec le gif spécifique après l'achat
            const successEmbed = new EmbedBuilder()
              .setColor("#00ff00")
              .setTitle("Achat réussi !")
              .setDescription(
                `Contente d'avoir fait affaire avec toi, tu as acquis **${item.name}** !`
              )
              .setImage(
                "https://cdn.discordapp.com/attachments/1352351466328948786/1357209948228161618/jade-honkai.gif?ex=67ef5fc3&is=67ee0e43&hm=11856319aadfc6267f8de66da275cdd49c048567516c020402207978fcbc1dd1&"
              ); // Gif spécifique après l'achat

            await confirmInteraction.update({
              embeds: [successEmbed],
              components: [],
            });

            confirmCollector.stop();
          }
        });
      }
    });

    collector.on("end", async () => {
      // Au lieu de vérifier la suppression du message, on fait une simple mise à jour du message
      await interaction.editReply({
        content:
          "La boutique n'a pas que cela à faire que t'attendre, mais quand tu seras décidé, tu sais où me trouver.",
        embeds: [],
        components: [],
      });
    });
  },
};
