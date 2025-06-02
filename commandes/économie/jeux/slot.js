const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

// Système de rareté pondérée
const SYMBOLS = [
  { emoji: "🍒", rarity: "commun", weight: 40, multiplier: 3 },
  { emoji: "🍋", rarity: "commun", weight: 35, multiplier: 3 },
  { emoji: "🍇", rarity: "commun", weight: 30, multiplier: 3 },
  { emoji: "🔔", rarity: "rare", weight: 15, multiplier: 5 },
  { emoji: "🍀", rarity: "rare", weight: 10, multiplier: 5 },
  { emoji: "💎", rarity: "légendaire", weight: 5, multiplier: 10 },
  { emoji: "7️⃣", rarity: "légendaire", weight: 2, multiplier: 10 },
];

// Fonction pour tirage pondéré
function getRandomSymbol() {
  const totalWeight = SYMBOLS.reduce((sum, sym) => sum + sym.weight, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  for (const symbol of SYMBOLS) {
    cumulative += symbol.weight;
    if (rand < cumulative) return symbol;
  }
  return SYMBOLS[0]; // sécurité
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slot")
    .setDescription("Tente ta chance à la machine à sous !")
    .addIntegerOption((option) =>
      option
        .setName("mise")
        .setDescription("Montant de pièces à miser")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mise = interaction.options.getInteger("mise");
    const userId = interaction.user.id;

    const userEco = await Economie.findByPk(userId);
    if (!userEco || userEco.pièces < mise || mise <= 0) {
      return interaction.reply({
        content: "❌ Tu n'as pas assez de pièces ou ta mise est invalide.",
        ephemeral: true,
      });
    }

    // Embeds d'attente avec animation des jetons
    const loadingEmbed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("🎰 Machine à Sous")
      .setDescription("La machine tourne... 🔄")
      .setImage("https://media.tenor.com/l46lGSm-MRQAAAAC/slot-machine.gif")
      .setFooter({
        text: `Pari de ${mise} pièces - ${interaction.user.username}`,
      });

    const emojis = ["🍒", "🍋", "🍇", "🔔", "🍀", "💎", "7️⃣"]; // Emojis possibles

    const updateEmbed = async (message, step) => {
      let emojisCurrentStep = [
        emojis[step % emojis.length],
        emojis[(step + 1) % emojis.length],
        emojis[(step + 2) % emojis.length],
      ];
      await message.edit({
        embeds: [
          loadingEmbed.setDescription(
            `La machine tourne... 🔄\n[${emojisCurrentStep.join(" | ")}]`
          ),
        ],
      });
    };

    const message = await interaction.reply({ embeds: [loadingEmbed] });

    // Animation en 3 étapes
    await new Promise(
      (resolve) => setTimeout(() => resolve(), 1000) // Attente 1 sec pour le premier "tour"
    );
    await updateEmbed(message, 1);

    await new Promise(
      (resolve) => setTimeout(() => resolve(), 1000) // Attente 1 sec pour le deuxième "tour"
    );
    await updateEmbed(message, 2);

    await new Promise(
      (resolve) => setTimeout(() => resolve(), 1000) // Attente 1 sec pour le troisième "tour"
    );
    await updateEmbed(message, 3);

    // Tirage final
    const rouleaux = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    const [a, b, c] = rouleaux;

    const resultEmojis = rouleaux.map((s) => s.emoji).join(" | ");
    let gain = 0;
    let messageText = "";

    // 3 symboles identiques
    if (a.emoji === b.emoji && b.emoji === c.emoji) {
      gain = mise * a.multiplier;
      messageText = `🔥 3 ${a.emoji} ! (Rareté **${a.rarity}**) → Tu gagnes **${gain} pièces** !`;
    }
    // 2 symboles identiques
    else if (
      a.emoji === b.emoji ||
      b.emoji === c.emoji ||
      a.emoji === c.emoji
    ) {
      gain = Math.floor(mise * 1.5);
      messageText = `🔁 Deux symboles identiques → Tu gagnes **${gain} pièces** !`;
    } else {
      gain = -mise;
      messageText = `💥 Aucun symbole identique → Tu perds **${mise} pièces**.`;
    }

    userEco.pièces += gain;
    await userEco.save();

    // Embed de résultat final
    const resultEmbed = new EmbedBuilder()
      .setColor(gain > 0 ? "Green" : "Red")
      .setTitle("🎰 Résultat de la Machine à Sous")
      .setDescription(`**[ ${resultEmojis} ]**\n\n${messageText}`)
      .setFooter({ text: `Solde mis à jour pour ${interaction.user.username}` })
      .setTimestamp();

    await message.edit({ embeds: [resultEmbed] });
  },
};
