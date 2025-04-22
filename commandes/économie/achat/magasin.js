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

const randomPhrases = [
  "Bonjour, je m'appelle Jade. Tu m'as appelée. Si tu veux un prêt, tu dois d'abord mettre en gage un bien de valeur équivalente. Ta dignité, tes sentiments, ou même ta vie. Qu'est-ce que tu as à me proposer en échange ?",
  "Tu te sens perdu/perdue ? Ne t'en fais pas, on peut parler de ce que tu veux.",
  "L'argent est la recette du bonheur. La meilleure façon de s'en servir est d'en donner à ceux qui en ont besoin. C'est pourquoi mon travail consiste à apporter du bonheur aux autres. C'est à la portée de tous... à condition d'en payer le prix.",
  "« Madame Bonajade » ? Ce n'est qu'une maigre contribution, pas de quoi en faire un plat. Toute bonne action est une transaction avec un prix caché, mais un véritable acte de gentillesse va bien au-delà de n'importe quel contrat.",
  "Il n'existe aucune méthode pour quantifier la valeur de toute chose, puisque les impressions et sentiments façonnent le jugement... C'est pourquoi pour les personnes au caractère noble, les faveurs sont la dette la plus onéreuse.",
  "Je ne vois aucun inconvénient à ce que les clients veuillent racheter les biens mis en gage après avoir réalisé leur souhait. Je leur propose simplement une nouvelle alternative, qui leur permettra d'aller encore plus loin, le tout à un prix dérisoire... Devine ce qu'ils finissent par choisir ?",
  "Un investissement n'est pas un acte de charité. Ne l'oublie pas.",
];

const activeShops = new Set();
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
    const lastUsedTime = lastUsed.get(userId);
    const currentTime = Date.now();

    if (lastUsedTime && currentTime - lastUsedTime < COOLDOWN_TIME) {
      const timeLeft = Math.ceil(
        (COOLDOWN_TIME - (currentTime - lastUsedTime)) / 1000
      );
      return interaction.reply({
        content: `Tu dois attendre encore ${timeLeft} seconde(s)...`,
        flags: MessageFlags.Ephemeral,
      });
    }

    lastUsed.set(userId, currentTime);

    if (activeShops.has(userId)) {
      return interaction.reply({
        content: "Tu es déjà en train de discuter avec Jade...",
        flags: MessageFlags.Ephemeral,
      });
    }

    activeShops.add(userId);

    const items = await Objets.findAll();
    let shopClosed = false;

    if (items.length === 0) {
      activeShops.delete(userId);
      return interaction.reply(
        "La boutique Bonajade est pour le moment indisponible."
      );
    }

    const shopEmbed = new EmbedBuilder()
      .setColor("#9b00ff")
      .setTitle("Bienvenue dans la **Boutique Bonajade**")
      .setDescription(
        "Il y a des choses qui ne se mesurent pas en termes de prix..."
      )
      .addFields(
        items.map((item) => ({
          name: `${item.name} - ${item.price} pièces`,
          value: "Sélectionne cet objet pour l'acheter.",
          inline: false,
        }))
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/1352351466328948786/1357209612801015808/jade-a-moment-among-the-stars-a-moment-among-the-stars.gif"
      )
      .setFooter({
        text: "Jade",
        iconURL:
          "https://www.pockettactics.com/wp-content/sites/pockettactics/2024/04/Honkai-Star-Rail-Jade.jpg",
      })
      .setTimestamp()
      .addFields({
        name: "Message de Mademoiselle",
        value: getRandomPhrase(),
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

    const filter = (i) => i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 35000,
    });

    collector.on("collect", async (i) => {
      if (i.customId !== "select_item") return;

      const itemId = i.values[0];
      const item = await Objets.findByPk(itemId);

      if (!item) {
        return i.reply({
          content: "Cet objet n'existe pas.",
          flags: MessageFlags.Ephemeral,
        });
      }

      const userEconomy = await Economie.findOne({ where: { userId } });

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

        try {
          if (!i.replied && !i.deferred) {
            await i.update({ embeds: [errorEmbed], components: [] });
          }
        } catch (err) {
          console.warn("Erreur interaction (fond insuffisant) :", err.message);
        }

        return;
      }

      userEconomy.pièces -= item.price;
      await userEconomy.save();

      const existingItem = await Inventaire.findOne({
        where: { userId, itemId: item.id },
      });

      if (existingItem) {
        existingItem.quantity += 1;
        await existingItem.save();
      } else {
        await Inventaire.create({ userId, itemId: item.id, quantity: 1 });
      }

      const successEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Achat réussi !")
        .setDescription(`Tu as acquis **${item.name}** !`)
        .setImage(
          "https://cdn.discordapp.com/attachments/1352351466328948786/1357209948228161618/jade-honkai.gif"
        );

      try {
        if (!i.replied && !i.deferred) {
          await i.update({ embeds: [successEmbed], components: [] });
        }
      } catch (err) {
        console.warn(
          "Erreur lors de la mise à jour de l'interaction :",
          err.message
        );
      }

      shopClosed = true;
      activeShops.delete(userId);
    });

    collector.on("end", async () => {
      if (!shopClosed) {
        try {
          await interaction.editReply({
            content: "La boutique n'a pas que cela à faire que t'attendre...",
            embeds: [],
            components: [],
          });
        } catch (err) {
          console.warn("Erreur editReply (collector fin) :", err.message);
        }
      }

      activeShops.delete(userId);
    });
  },
};
