const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");
const BulleUser = require("../../../Sequelize/modèles/argent/bulle/BubbleUser");
const BulleUpgrade = require("../../../Sequelize/modèles/argent/bulle/BubbleUpgrade");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const {
  upgrade,
  getAllUpgradeChoices,
} = require("../../../autoscript/autobulle/upgradeManager");
const {
  collect,
  convert,
  click,
} = require("../../../autoscript/autobulle/bubbleEconomy");
const visuals = require("../../../autoscript/autobulle/visuelsentreprise");

const ENTREPRISE_TIERS = {
  "à la sauvette": 1,
  "stand ambulant": 2,
  "boutique locale": 3,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bulle")
    .setDescription("Mini-jeu de vente de bulles")
    .addSubcommand((sub) =>
      sub
        .setName("licence")
        .setDescription("Acheter une licence de vente de bulles")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type de ton business")
            .setRequired(true)
            .addChoices(
              { name: "Magasin", value: "magasin" },
              { name: "Restaurant", value: "restaurant" },
              { name: "Refuge", value: "refuge" }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("collect")
        .setDescription("Collecte tes bulles passives (toutes les 30 min)")
    )
    .addSubcommand((sub) =>
      sub.setName("convert").setDescription("Convertir tes bulles en pièces")
    )
    .addSubcommand((sub) =>
      sub
        .setName("click")
        .setDescription("Clique pour générer des bulles activement")
    )
    .addSubcommand((sub) =>
      sub.setName("upgrade").setDescription("Ouvre la boutique d'améliorations")
    )
    .addSubcommand((sub) =>
      sub
        .setName("statut")
        .setDescription("Affiche l'état du magasin")
        .addUserOption((opt) =>
          opt
            .setName("utilisateur")
            .setDescription("Utilisateur dont tu veux voir le commerce")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("leaderboard")
        .setDescription("Classement des meilleurs vendeurs")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type de classement")
            .setRequired(true)
            .addChoices(
              { name: "Bulles actuelles", value: "instant" },
              { name: "Bulles historiques", value: "total" }
            )
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (sub === "licence") {
      const type = interaction.options.getString("type");
      const existing = await BulleUser.findByPk(userId);
      if (existing) return interaction.reply("Tu as déjà une licence.");
      const eco = await Economie.findByPk(userId);
      if (!eco || eco.pièces < 5000)
        return interaction.reply(
          "Tu n'as pas assez de pièces (5000 requises)."
        );
      eco.pièces -= 5000;
      await eco.save();
      await BulleUser.create({ userId, businessType: type });
      const vis = { ...visuals[type], ...visuals["à la sauvette"] };
      const embed = new EmbedBuilder()
        .setTitle(`${vis.emoji} | Licence Obtenue !`)
        .setDescription(`🎉 Tu as lancé ton **${type}** de vente de bulles !`)
        .setColor(vis.color)
        .setThumbnail(vis.icon)
        .setFooter({ text: "Utilise /bulle collect pour commencer." });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "collect") {
      const user = await BulleUser.findByPk(userId);
      if (!user) return interaction.reply("Tu n'as pas encore de licence.");
      const vis = {
        ...visuals[user.businessType],
        ...visuals[user.entreprise],
      };
      const res = await collect(userId);
      const embed = new EmbedBuilder()
        .setTitle(`${vis.emoji} | Résultats de la Collecte`)
        .setDescription(`📦 **Collecte terminée !**\n${res}`)
        .setColor(vis.color)
        .setThumbnail(vis.icon)
        .setFooter({
          text: "⏳ Reviens dans 30 minutes pour collecter à nouveau.",
        });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "click") {
      const user = await BulleUser.findByPk(userId);
      if (!user) return interaction.reply("Tu n'as pas encore de licence.");
      const vis = {
        ...visuals[user.businessType],
        ...visuals[user.entreprise],
      };
      const amount = await click(userId);
      const embed = new EmbedBuilder()
        .setTitle(`${vis.emoji} | Clique !`)
        .setDescription(`🖱️ Tu as gagné **${amount}** bulles en cliquant !`)
        .setColor(vis.color)
        .setThumbnail(vis.icon)
        .setFooter({ text: "Clique encore pour générer plus de bulles !" });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "convert") {
      const user = await BulleUser.findByPk(userId);
      const vis = {
        ...visuals[user.businessType],
        ...visuals[user.entreprise],
      };
      const res = await convert(userId);
      const embed = new EmbedBuilder()
        .setTitle(`${vis.emoji} | Conversion des Bulles`)
        .setDescription(`💱 **Échange effectué !**\n${res}`)
        .setColor(vis.color)
        .setThumbnail(vis.icon)
        .setFooter({ text: "Utilise tes pièces pour d'autres activités !" });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "upgrade") {
      const user = await BulleUser.findByPk(userId);
      if (!user) return interaction.reply("Tu n'as pas encore de commerce.");

      const entrepriseData =
        require("../../../autoscript/autobulle/entreprises")[user.entreprise];
      if (!entrepriseData) return interaction.reply("Entreprise invalide.");

      const upgradesAvailable = Object.entries(entrepriseData.upgrades);

      const userUpgrades = await BulleUpgrade.findAll({ where: { userId } });

      const options = upgradesAvailable.map(([name, { baseCost, effect }]) => {
        const userUpgrade = userUpgrades.find((u) => u.upgradeName === name);
        const level = userUpgrade ? userUpgrade.level : 0;
        const cost = baseCost * (level + 1);
        return {
          label: `${name} (niv ${level})`,
          description: `Effet: +${effect} | Coût: ${cost} bulles`,
          value: name,
        };
      });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("upgrade_menu")
        .setPlaceholder("Choisis une amélioration à acheter")
        .addOptions(options.slice(0, 25));

      const row = new ActionRowBuilder().addComponents(menu);

      const embed = new EmbedBuilder()
        .setTitle("🛒 Boutique d'améliorations")
        .setDescription(
          "Choisis une amélioration à acheter dans la liste ci-dessous."
        )
        .setColor(0xffc107);

      await interaction.reply({ embeds: [embed], components: [row] });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
        max: 1,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== userId)
          return i.reply({
            content: "Ce menu n'est pas pour toi.",
            ephemeral: true,
          });
        const upgradeName = i.values[0];
        const result = await upgrade(userId, upgradeName);
        await i.update({ content: `🛠️ ${result}`, components: [], embeds: [] });
      });
    }

    if (sub === "statut") {
      const target =
        interaction.options.getUser("utilisateur") || interaction.user;
      const userData = await BulleUser.findByPk(target.id);
      if (!userData)
        return interaction.reply("Cet utilisateur n'a pas de commerce actif.");

      const upgradesList = await BulleUpgrade.findAll({
        where: { userId: target.id },
      });

      const vis = {
        ...visuals[userData.businessType],
        ...visuals[userData.entreprise],
      };

      let bullesPerSec = 0;
      let bullesPerClick = 1 * (ENTREPRISE_TIERS[userData.entreprise] || 1);

      for (const up of upgradesList) {
        const upgrade = require("../../../autoscript/autobulle/entreprises")[
          userData.entreprise
        ].upgrades[up.upgradeName];
        if (upgrade) {
          if (up.upgradeName.toLowerCase().includes("clic")) {
            bullesPerClick += upgrade.effect * up.level;
          } else {
            bullesPerSec += upgrade.effect * up.level;
          }
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(
          `${vis.emoji} | Statut du ${userData.businessType} (${userData.entreprise})`
        )
        .setColor(vis.color)
        .setThumbnail(vis.icon)
        .setDescription(
          `🧼 **Commerce en activité**\nVoici l'état actuel de ce business.`
        )
        .addFields(
          {
            name: "📦 Bulles en stock",
            value: `**${userData.bulles}**`,
            inline: true,
          },
          { name: "🔁 Bulles/s", value: `**${bullesPerSec}**`, inline: true },
          {
            name: "🖱️ Bulles/clic",
            value: `**${bullesPerClick}**`,
            inline: true,
          },
          {
            name: "🏆 Total historique",
            value: `**${userData.totalBulles}**`,
            inline: true,
          },
          {
            name: "🕒 Dernière collecte",
            value: userData.lastCollect
              ? `<t:${Math.floor(
                  new Date(userData.lastCollect).getTime() / 1000
                )}:R>`
              : "Jamais",
            inline: true,
          },
          {
            name: "🔧 Améliorations",
            value: upgradesList.length
              ? upgradesList
                  .map((up) => `➤ ${up.upgradeName} : Niv. **${up.level}**`)
                  .join("\n")
              : "*Aucune amélioration active.*",
            inline: false,
          }
        )
        .setFooter({
          text: "Continue de développer ton commerce pour gagner plus !",
        });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "leaderboard") {
      const type = interaction.options.getString("type");
      const users = await BulleUser.findAll();

      users.sort((a, b) => {
        const tierA = ENTREPRISE_TIERS[a.entreprise] || 0;
        const tierB = ENTREPRISE_TIERS[b.entreprise] || 0;

        if (tierA !== tierB) return tierB - tierA;
        return type === "total"
          ? b.totalBulles - a.totalBulles
          : b.bulles - a.bulles;
      });

      const embed = new EmbedBuilder()
        .setTitle(
          `📊 Leaderboard - ${
            type === "total" ? "Total Collecté" : "Bulles Actuelles"
          }`
        )
        .setColor(0x00bcd4)
        .setDescription(
          users
            .slice(0, 10)
            .map(
              (u, i) =>
                `**#${i + 1}** <@${u.userId}> - ${
                  type === "total" ? u.totalBulles : u.bulles
                } bulles (${u.entreprise})`
            )
            .join("\n")
        );

      return interaction.reply({ embeds: [embed] });
    }
  },
};
