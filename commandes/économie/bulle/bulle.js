const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const BubbleProfile = require("../../../Sequelize/modèles/argent/bulle/BubbleProfile");
const BubbleUpgrade = require("../../../Sequelize/modèles/argent/bulle/BubbleUpgrade");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bulle")
    .setDescription("Mini jeu idle économique de bulles")
    .addSubcommand((sub) =>
      sub
        .setName("entreprise")
        .setDescription("Créer ton entreprise")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Choisis ton type d'entreprise")
            .setRequired(true)
            .addChoices(
              { name: "Magasin", value: "magasin" },
              { name: "Restaurant", value: "restaurant" },
              { name: "Vidéo Club", value: "videoclub" },
              { name: "Cinéma", value: "cinema" }
            )
        )
        .addStringOption((opt) =>
          opt
            .setName("nom")
            .setDescription("Nom de ton entreprise personnalisé")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("statut").setDescription("Voir ton entreprise")
    )
    .addSubcommand((sub) =>
      sub.setName("classement").setDescription("Voir le classement des bulles")
    )
    .addSubcommand((sub) =>
      sub.setName("améliorer").setDescription("Acheter une amélioration")
    )
    .addSubcommand((sub) =>
      sub
        .setName("crime")
        .setDescription("Effectuer un crime")
        .addStringOption((opt) =>
          opt
            .setName("action")
            .setDescription("Type de crime")
            .setRequired(true)
            .addChoices(
              { name: "Vol de bulles", value: "vol" },
              { name: "Sabotage", value: "sabotage" },
              { name: "Piratage instantané", value: "piratage" }
            )
        )
        .addUserOption((opt) =>
          opt
            .setName("cible")
            .setDescription("Cible pour le vol ou sabotage")
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    let profile = await BubbleProfile.findOne({ where: { userId } });

    function getRangName(level) {
      const rangs = {
        1: "À la sauvette",
        2: "Stand ambulant",
        3: "Boutique de quartier",
        4: "Franchise locale",
        5: "Empire commercial",
      };
      return rangs[level] || `Rang ${level}`;
    }

    async function applyUpgrades(profile, userId) {
      const userUpgrades = await BubbleUpgrade.findAll({ where: { userId } });
      let basePassive = 0;

      userUpgrades.forEach((upgrade) => {
        switch (upgrade.upgradeName) {
          // MAGASIN
          case "Flyers":
            basePassive += 1;
            break;
          case "Panneau":
            basePassive += 2;
            break;
          case "Mascotte":
            basePassive += 3;
            break;
          case "Fidélité":
            basePassive += 4;
            break;
          case "Happy Hour":
            basePassive += 5;
            break;
          case "Stand ambulant":
            basePassive += 6;
            break;

          // RESTAURANT
          case "Menu":
            basePassive += 1;
            break;
          case "Serveur":
            basePassive += 2;
            break;
          case "Fourneau":
            basePassive += 3;
            break;
          case "Livraison":
            basePassive += 4;
            break;
          case "Influenceur":
            basePassive += 5;
            break;
          case "Camion de rue":
            basePassive += 6;
            break;

          // VIDEOCLUB
          case "Vol":
            basePassive += 1;
            break;
          case "Hack clients":
            basePassive += 2;
            break;
          case "Films rares":
            basePassive += 3;
            break;
          case "Sabotage":
            basePassive += 4;
            break;
          case "Faux abonnements":
            basePassive += 5;
            break;
          case "Réseau pirate":
            basePassive += 6;
            break;

          // CINEMA
          case "Braquage":
            basePassive += 1;
            break;
          case "Piratage billets":
            basePassive += 2;
            break;
          case "Infiltration":
            basePassive += 3;
            break;
          case "Fraude pubs":
            basePassive += 4;
            break;
          case "Falsification":
            basePassive += 5;
            break;
          case "Franchise underground":
            basePassive += 6;
            break;
        }
      });

      profile.passiveRate = basePassive * (profile.level || 1);
      await profile.save();
    }

    module.exports = { applyUpgrades };

    const upgradePrices = {
      magasin: {
        Flyers: 50,
        Panneau: 100,
        Mascotte: 150,
        Fidélité: 200,
        "Happy Hour": 250,
        "Stand ambulant": 300,
      },
      restaurant: {
        Menu: 60,
        Serveur: 120,
        Fourneau: 180,
        Livraison: 240,
        Influenceur: 300,
        "Camion de rue": 360,
      },
      videoclub: {
        Vol: 40,
        "Hack clients": 80,
        "Films rares": 120,
        Sabotage: 160,
        "Faux abonnements": 200,
        "Réseau pirate": 240,
      },
      cinema: {
        Braquage: 70,
        "Piratage billets": 140,
        Infiltration: 210,
        "Fraude pubs": 280,
        Falsification: 350,
        "Franchise underground": 420,
      },
    };

    if (sub === "entreprise") {
      if (profile)
        return interaction.reply({
          content: "Tu as déjà une entreprise !",
        });

      const type = interaction.options.getString("type");
      const name = interaction.options.getString("nom") || type;

      await BubbleProfile.create({
        userId,
        businessType: type,
        businessName: name,
        bubbles: 0,
        level: 1,
        passiveRate: 1,
      });

      const embed = new EmbedBuilder()
        .setTitle("🎉 Félicitations !")
        .setDescription(
          `Ton entreprise **${name}** vient d'ouvrir ses portes !`
        )
        .setImage(
          "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTA3eWZtMGVzMjRjN2Z3eXU5ZHNmbWhnNDlsOG5hOWpqYWdtYjlybSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/P8VFXOefQK3SxL2sSo/giphy.gif"
        )
        .setColor("#00A8E8");

      return interaction.reply({
        content: `🚀 Ton entreprise **${name}** a été lancée !`,
        embeds: [embed],
      });
    }

    if (!profile)
      return interaction.reply({
        content:
          "Tu dois d'abord créer ton entreprise avec `/bulle entreprise`.",
      });

    if (sub === "statut") {
      const embed = new EmbedBuilder()
        .setTitle(
          `Entreprise : ${profile.businessName || profile.businessType}`
        )
        .setImage(
          "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmp5eW00bWNpZHBxeGZwZmo2c2hia2huMTNsZ2FsbnA3NjBmMnk3ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lqhNVAGgasXD6iFmKX/giphy.gif"
        )
        .addFields(
          {
            name: "Type 💙",
            value: profile.businessType,
            inline: true,
          },
          {
            name: "Nom 📅",
            value: profile.businessName || profile.businessType,
            inline: true,
          },
          {
            name: "Bulles 💧",
            value: profile.bubbles.toString(),
            inline: true,
          },
          {
            name: "Rang 🏅",
            value: getRangName(profile.level ?? 1),
            inline: true,
          },
          {
            name: "Rendement 🕒",
            value: `${profile.passiveRate} bulles / 10min`,
            inline: true,
          }
        )
        .setColor("#015871");

      return interaction.reply({ embeds: [embed] });
    }
    if (sub === "classement") {
      const topProfiles = await BubbleProfile.findAll({
        order: [["bubbles", "DESC"]],
        limit: 10,
      });

      const embed = new EmbedBuilder()
        .setTitle("🏆 Classement des bulles")
        .setColor("Gold");

      for (let i = 0; i < topProfiles.length; i++) {
        const user = await interaction.client.users.fetch(
          topProfiles[i].userId
        );
        embed.addFields({
          name: `#${i + 1} - ${user.username}`,
          value: `💧 ${topProfiles[i].bubbles} bulles`,
        });
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "améliorer") {
      const upgradesList = {
        magasin: [
          "Flyers",
          "Panneau",
          "Mascotte",
          "Fidélité",
          "Happy Hour",
          "Stand ambulant",
        ],
        restaurant: [
          "Menu",
          "Serveur",
          "Fourneau",
          "Livraison",
          "Influenceur",
          "Camion de rue",
        ],
        videoclub: [
          "Vol",
          "Hack clients",
          "Films rares",
          "Sabotage",
          "Faux abonnements",
          "Réseau pirate",
        ],
        cinema: [
          "Braquage",
          "Piratage billets",
          "Infiltration",
          "Fraude pubs",
          "Falsification",
          "Franchise underground",
        ],
      };

      const businessType = profile.businessType;
      const allUpgrades = upgradesList[businessType];
      const userUpgrades = await BubbleUpgrade.findAll({ where: { userId } });
      const owned = userUpgrades.map((u) => u.upgradeName);

      // Séparer les upgrades "normales" et le "rank-up"
      const normalUpgrades = allUpgrades.slice(0, -1);
      const rankUp = allUpgrades[allUpgrades.length - 1];

      const availableNormal = normalUpgrades.filter((u) => !owned.includes(u));
      const canRankUp =
        owned.length >= normalUpgrades.length && !owned.includes(rankUp);

      const options = [];

      for (const upgradeName of availableNormal) {
        const cost = upgradePrices[businessType][upgradeName];
        options.push({
          label: upgradeName,
          description: `Coût : ${cost} bulles`,
          value: upgradeName,
        });
      }

      if (canRankUp) {
        const cost = upgradePrices[businessType][rankUp];
        options.push({
          label: `🔺 ${rankUp}`,
          description: `RANG SUPÉRIEUR ! Coût : ${cost} bulles`,
          value: rankUp,
          emoji: "💼",
        });
      }

      if (options.length === 0) {
        return interaction.reply({
          content: "✅ Tu as déjà toutes les améliorations disponibles !",
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Améliorations pour ${profile.businessName || businessType}`)
        .setDescription(
          "Sélectionne une amélioration à acheter avec tes bulles 💧"
        )
        .setColor("Aqua");

      for (const opt of options) {
        embed.addFields({
          name: opt.label,
          value: opt.description,
          inline: true,
        });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`upgrade_select_${interaction.user.id}`)
        .setPlaceholder("Choisis une amélioration")
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      return interaction.reply({
        embeds: [embed],
        components: [row],
      });
    }

    if (sub === "crime") {
      if (!["videoclub", "cinema"].includes(profile.businessType)) {
        return interaction.reply(
          "❌ Seules les entreprises **Vidéo Club** et **Cinéma** peuvent effectuer des crimes."
        );
      }

      const action = interaction.options.getString("action");
      const targetUser = interaction.options.getUser("cible");

      // Effet d'un échec aléatoire
      const randomChance = Math.random() < 0.3; // 30% chance d'échec
      const cooldownKey = `${userId}-${action}`;
      const cooldowns = interaction.client.bubbleCooldowns || {};
      interaction.client.bubbleCooldowns = cooldowns;
      const last = cooldowns[cooldownKey];

      if (last && Date.now() - last < 5 * 60 * 1000) {
        return interaction.reply(
          "🕒 Tu dois attendre encore un peu avant de refaire cette action."
        );
      }

      if (action === "vol") {
        let amount = 0;
        let targetName = "";
        let successMessage = "";
        let gifURL =
          "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm9icHgxZnVvdmN1MnBnYTRkaXFuM2c4Mmc4aXlmYzhnd2szemM4cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/z6TMaaNJKIAX6/giphy.gif"; // GIF de vol

        if (targetUser) {
          const target = await BubbleProfile.findOne({
            where: { userId: targetUser.id },
          });

          if (!target || target.bubbles < 10) {
            return interaction.reply(
              "🤷 Pas assez de bulles à voler chez la cible."
            );
          }

          amount = Math.floor(target.bubbles * 0.3);
          target.bubbles -= amount;
          targetName = targetUser.username;
          await target.save();
          successMessage = `🕶️ Tu as volé **${amount} bulles** à **${targetName}** !`;
        }
        // Si échec
        if (randomChance) {
          amount = Math.floor(amount * 0.5); // Vol partiellement échoué, seulement la moitié des bulles
          successMessage = `⚠️ Vol échoué ! Tu n'as réussi qu'à voler **${amount} bulles**.`;
          gifURL =
            "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa29oMzd5ZDgweGhsdWk0Y2EwM3V6N3o1YmRuOHJpNGlkZDM1NHl3NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RGVqj8v6aoY2UFzWYa/giphy.gif"; // GIF d'échec
        }

        profile.bubbles += amount;
        await profile.save();
        cooldowns[cooldownKey] = Date.now();

        const embed = new EmbedBuilder()
          .setTitle("💼 Vol réussi !")
          .setDescription(successMessage)
          .setImage(gifURL)
          .setColor("#0E2954"); // Bleu foncé

        return interaction.reply({ embeds: [embed] });
      }

      if (action === "sabotage") {
        let targetName = "";
        let target = null;
        let successMessage = "";
        let gifURL =
          "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWo2bmRucmN4MnR5YzhrcjMwazFrdDM1cWVyOWlyYmFpbjJ2d3l0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sBdepHrDXnU7m/giphy.gif"; // GIF de sabotage
        let coinsEarned = 0;
        let coinsLost = 0;

        const embedLoading = new EmbedBuilder()
          .setTitle("🔨 Sabotage en cours...")
          .setDescription(
            "Tentative de sabotage en cours... Veuillez patienter..."
          )
          .setColor("#FF4D4D")
          .setImage(
            "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWo2bmRucmN4MnR5YzhrcjMwazFrdDM1cWVyOWlyYmFpbjJ2d3l0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sBdepHrDXnU7m/giphy.gif"
          ); // GIF de chargement

        await interaction.reply({ embeds: [embedLoading] });

        // Attendre quelques secondes avant de rendre le résultat
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Attente de 2 secondes

        if (targetUser) {
          target = await BubbleProfile.findOne({
            where: { userId: targetUser.id },
          });

          if (!target || target.passiveRate < 2) {
            return interaction.reply(
              "🚫 Cette cible est trop faible pour être sabotée."
            );
          }

          target.passiveRate -= 2;
          targetName = targetUser.username;
          coinsEarned = Math.floor(Math.random() * 50) + 20; // Gagner entre 20 et 70 pièces
          profile.coins += coinsEarned;
          await target.save();
          successMessage = `🧨 Tu as saboté **${targetName}** et gagné **${coinsEarned} pièces** !`;
          // Chance d'échec : si échec, l'utilisateur perd des pièces
          if (randomChance) {
            coinsLost = Math.floor(coinsEarned * 0.5); // Perd moitié des pièces
            profile.coins -= coinsLost;
            successMessage = `⚠️ Sabotage échoué, tu as perdu **${coinsLost} pièces**.`;
            gifURL =
              "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWo2bmRucmN4MnR5YzhrcjMwazFrdDM1cWVyOWlyYmFpbjJ2d3l0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sBdepHrDXnU7m/giphy.gif"; // GIF échec sabotage
          }

          await profile.save();
          cooldowns[cooldownKey] = Date.now();

          const embed = new EmbedBuilder()
            .setTitle("💥 Sabotage terminé !")
            .setDescription(successMessage)
            .setImage(gifURL)
            .setColor("#FF4D4D"); // Rouge

          return interaction.editReply({ embeds: [embed] });
        }

        if (action === "piratage") {
          const gain = Math.floor(30 + Math.random() * 70);
          profile.bubbles += gain;

          // Chance d'échec
          let successMessage = `💻 Tu as piraté avec succès et gagné **${gain} bulles** !`;
          let gifURL =
            "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjF1N2FuajJwM2lkeTljb3hvdzN4OTZ0anI4Mjl1bXgwNXQ5N2U5aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sPN6dcdruDgdi/giphy.gif";

          if (randomChance) {
            const loss = Math.floor(gain * 0.5); // Perd moitié de l'argent dans un échec
            profile.bubbles -= loss;
            successMessage = `⚠️ Piratage échoué, tu as perdu **${loss} bulles**.`;
            gifURL =
              "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjF1N2FuajJwM2lkeTljb3hvdzN4OTZ0anI4Mjl1bXgwNXQ5N2U5aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sPN6dcdruDgdi/giphy.gif"; // GIF échec piratage
          }

          await profile.save();
          cooldowns[cooldownKey] = Date.now();

          const embed = new EmbedBuilder()
            .setTitle("💻 Piratage réussi !")
            .setDescription(successMessage)
            .setImage(gifURL)
            .setColor("#0E4D92"); // Bleu

          return interaction.reply({ embeds: [embed] });
        }
      }
    }
  },
};
