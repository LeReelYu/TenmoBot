const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Objets = require("../../../Sequelize/modèles/argent/vente/objets");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const Inventaire = require("../../../Sequelize/modèles/argent/vente/inventaire");

// Liste de phrases aléatoires
const randomPhrases = [
  "Bonjour, je m'appelle Jade. Tu m'as appelée. Si tu veux un prêt, tu dois d'abord mettre en gage un bien de valeur équivalente. Ta dignité, tes sentiments, ou même ta vie. Qu'est-ce que tu as à me proposer en échange ?",
  "Tu te sens perdu/perdue ? Ne t'en fais pas, on peut parler de ce que tu veux.",
  "L'argent est la recette du bonheur. La meilleure façon de s'en servir est d'en donner à ceux qui en ont besoin. C'est pourquoi mon travail consiste à apporter du bonheur aux autres. C'est à la portée de tous... à condition d'en payer le prix.",
  "« Madame Bonajade » ? Ce n'est qu'une maigre contribution, pas de quoi en faire un plat. Toute bonne action est une transaction avec un prix caché, mais un véritable acte de gentillesse va bien au-delà de n'importe quel contrat.",
  "Il n'existe aucune méthode pour quantifier la valeur de toute chose, puisque les impressions et sentiments façonnent le jugement... C'est pourquoi pour les personnes au caractère noble, les faveurs sont la dette la plus onéreuse.",
  "Je ne vois aucun inconvénient à ce que les clients veuillent racheter les biens mis en gage après avoir réalisé leur souhait. Je leur propose simplement une nouvelle alternative, qui leur permettra d'aller encore plus loin, le tout à un prix dérisoire... Devine ce qu'ils finissent par choisir ?",
  "Un investissement n'est pas un acte de charité. Ne l'oublie pas.",
];

// 🔒 Utilisateurs avec shop ouvert
const activeShops = new Set();
// Suivi du cooldown des utilisateurs
const lastUsed = new Map();

const COOLDOWN_TIME = 5000;

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
    const userId = interaction.user.id;

    // Vérifier si un cooldown est en cours pour cet utilisateur
    const lastUsedTime = lastUsed.get(userId);
    const currentTime = Date.now();

    if (lastUsedTime && currentTime - lastUsedTime < COOLDOWN_TIME) {
      const timeLeft = Math.ceil(
        (COOLDOWN_TIME - (currentTime - lastUsedTime)) / 1000
      );
      return interaction.reply({
        content: `Tu dois attendre encore ${timeLeft} seconde(s) avant de pouvoir utiliser la commande à nouveau.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Mettre à jour le dernier moment d'utilisation
    lastUsed.set(userId, currentTime);

    // 🚫 Bloquer si shop déjà actif
    if (activeShops.has(userId)) {
      return interaction.reply({
        content:
          "Tu es déjà en train de discuter avec Jade. Termine cette transaction d'abord...",
        flags: MessageFlags.Ephemeral,
      });
    }

    activeShops.add(userId); // ✅ Marquer le shop comme actif

    const items = await Objets.findAll();
    let shopClosed = false;

    if (items.length === 0) {
      activeShops.delete(userId);
      return interaction.reply(
        "La boutique Bonajade est pour le moment indisponible."
      );
    }

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
        "https://cdn.discordapp.com/attachments/1352351466328948786/1357209612801015808/jade-a-moment-among-the-stars-a-moment-among-the-stars.gif"
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
      time: 35000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "select_item") {
        const itemId = i.values[0];
        const item = await Objets.findByPk(itemId);

        if (!item) {
          return i.reply({
            content: "Cet objet n'existe pas.",
            flags: MessageFlags.Ephemeral,
          });
        }

        const userEconomy = await Economie.findOne({
          where: { userId },
        });

        if (!userEconomy) {
          return i.reply({
            content: "Tu n'as pas de compte... Comme c'est curieux",
            flags: MessageFlags.Ephemeral,
          });
        }

        if (userEconomy.pièces < item.price) {
          const errorEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("Achat impossible")
            .setDescription(
              "Tu n'as pas assez de pièces pour acheter cet objet."
            );

          await i.update({
            embeds: [errorEmbed],
            components: [],
          });
          return;
        }

        // Retirer les pièces de l'utilisateur
        userEconomy.pièces -= item.price;
        await userEconomy.save();

        // Vérifier si l'objet est déjà dans l'inventaire
        const existingItem = await Inventaire.findOne({
          where: {
            userId,
            itemId: item.id,
          },
        });

        if (existingItem) {
          // Si l'objet existe déjà dans l'inventaire, on incrémente la quantity
          existingItem.quantity += 1;
          await existingItem.save(); // Sauvegarder la mise à jour
        } else {
          // Si l'objet n'existe pas, on l'ajoute avec une quantity de 1
          await Inventaire.create({
            userId,
            itemId: item.id,
            quantity: 1, // Remplacer quantité par quantity ici
          });
        }

        // Embed de succès avec le gif spécifique après l'achat
        const successEmbed = new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle("Achat réussi !")
          .setDescription(
            `Contente d'avoir fait affaire avec toi, tu as acquis **${item.name}** !`
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/1352351466328948786/1357209948228161618/jade-honkai.gif"
          ); // Gif spécifique après l'achat

        // Essayer d'éviter l'erreur d'interaction expirée en mettant à jour l'interaction correctement
        try {
          await i.update({
            embeds: [successEmbed],
            components: [],
          });
        } catch (error) {
          console.error(
            "Erreur lors de la mise à jour de l'interaction:",
            error
          );
        }

        shopClosed = true;
        activeShops.delete(userId); // ✅ Libérer l'accès à la commande
      }
    });

    collector.on("end", async () => {
      if (!shopClosed) {
        await interaction.editReply({
          content:
            "La boutique n'a pas que cela à faire que t'attendre, mais quand tu seras décidé, tu sais où me trouver.",
          embeds: [],
          components: [],
        });
      }

      activeShops.delete(userId); // ✅ Toujours débloquer à la fin
    });
  },
};
