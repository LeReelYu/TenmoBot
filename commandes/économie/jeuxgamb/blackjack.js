const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");

let canUseBlackjack = true; // Déclare un verrou global temporaire

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Joue une partie de Blackjack et parie des pièces !")
    .addIntegerOption((option) =>
      option
        .setName("mise")
        .setDescription("Nombre de pièces à miser")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Si la commande est utilisée trop rapidement (moins de 1 seconde d'écart)
    if (!canUseBlackjack) {
      return interaction.reply({
        content:
          "❌ La commande est temporairement bloquée. Veuillez attendre 1 seconde avant de réessayer.",
        ephemeral: true,
      });
    }

    // Bloque l'utilisation de la commande pendant 1 seconde
    canUseBlackjack = false;
    setTimeout(() => {
      canUseBlackjack = true;
    }, 1000); // 1 seconde

    const mise = interaction.options.getInteger("mise");
    const userId = interaction.user.id;

    const userEco = await Economie.findByPk(userId);
    if (!userEco || userEco.pièces < mise || mise <= 0) {
      // Fin de la partie si l'utilisateur n'a pas assez de pièces
      return interaction.reply({
        content:
          "❌ Tu n'as pas assez de pièces pour faire ce pari, ou tu essaies de miser un montant invalide.",
      });
    }

    // Code pour générer le deck et les mains comme tu l'avais fait auparavant
    const deck = [];
    const valeurs = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]; // 10 pour J, Q, K ; 11 pour As
    const couleurs = ["♠", "♥", "♦", "♣"];
    for (const couleur of couleurs) {
      for (const valeur of valeurs) {
        deck.push({ valeur, couleur });
      }
    }

    const drawCard = () => {
      const index = Math.floor(Math.random() * deck.length);
      return deck.splice(index, 1)[0];
    };

    const calcTotal = (hand) => {
      let total = hand.reduce((a, c) => a + c.valeur, 0);
      let aces = hand.filter((c) => c.valeur === 11).length;
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      return total;
    };

    const displayHand = (hand) =>
      hand.map((c) => `[${c.couleur}${c.valeur}]`).join(" ");

    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];

    let playerTotal = calcTotal(playerHand);
    let dealerTotal = calcTotal(dealerHand);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`🃏 Blackjack - Mise: ${mise} pièces`)
      .addFields(
        {
          name: "Ta main",
          value: `${displayHand(playerHand)} = **${playerTotal}**`,
        },
        { name: "Main du croupier", value: `[♦${dealerHand[0].valeur}] [?]` }
      )
      .setFooter({ text: "Clique sur Tirer ou Rester." });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("hit")
        .setLabel("Tirer")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("stand")
        .setLabel("Rester")
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      withResponse: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({
          content: "Ce n'est pas ton jeu !",
          flags: MessageFlags.Ephemeral,
        });

      if (i.customId === "hit") {
        playerHand.push(drawCard());
        playerTotal = calcTotal(playerHand);

        if (playerTotal > 21) {
          collector.stop("bust");
          return i.update({
            embeds: [
              embed
                .setFields(
                  {
                    name: "Ta main",
                    value: `${displayHand(playerHand)} = **${playerTotal}**`,
                  },
                  {
                    name: "Main du croupier",
                    value: `[♦${dealerHand[0].valeur}] [?]`,
                  }
                )
                .setColor(0xe74c3c)
                .setFooter({ text: "💥 Tu as dépassé 21, tu perds !" }),
            ],
            components: [],
          });
        } else {
          await i.update({
            embeds: [
              embed.setFields(
                {
                  name: "Ta main",
                  value: `${displayHand(playerHand)} = **${playerTotal}**`,
                },
                {
                  name: "Main du croupier",
                  value: `[♦${dealerHand[0].valeur}] [?]`,
                }
              ),
            ],
          });
        }
      } else if (i.customId === "stand") {
        collector.stop("stand");
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "stand") {
        while (dealerTotal < 17) {
          dealerHand.push(drawCard());
          dealerTotal = calcTotal(dealerHand);
        }

        let result = "";
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          result = `✅ Tu gagnes **${mise * 1.25}** pièces !`;
          userEco.pièces += mise;
        } else if (playerTotal < dealerTotal) {
          result = "❌ Tu perds ta mise.";
          userEco.pièces -= mise;
        } else {
          result = "🔁 Égalité, tu récupères ta mise.";
        }
        await userEco.save();

        const finalEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle("🃏 Fin de la partie")
          .addFields(
            {
              name: "Ta main",
              value: `${displayHand(playerHand)} = **${playerTotal}**`,
            },
            {
              name: "Main du croupier",
              value: `${displayHand(dealerHand)} = **${dealerTotal}**`,
            },
            { name: "Résultat", value: result }
          );

        await interaction.editReply({ embeds: [finalEmbed], components: [] });
      } else if (reason === "bust") {
        userEco.pièces -= mise;
        await userEco.save();
      } else {
        await interaction.editReply({ components: [] });
      }
    });
  },
};
