const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const Economie = require("../../../Sequelize/modèles/argent/économie");
const Cdvol = require("../../../Sequelize/modèles/argent/cooldowns/cdvol");
const Inventaire = require("../../../Sequelize/modèles/argent/vente/inventaire");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vol")
    .setDescription("Tente de voler des pièces à un autre membre !")
    .addUserOption((option) =>
      option
        .setName("cible")
        .setDescription("Le membre que tu veux essayer de voler")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const targetUser = interaction.options.getUser("cible");
    const now = Date.now();
    const cooldownTime = 3 * 60 * 60 * 1000; // 3 heures

    const cooldownRecord = await Cdvol.findOne({ where: { userId } });
    if (cooldownRecord && now - cooldownRecord.lastAttempt < cooldownTime) {
      const remainingTime = cooldownTime - (now - cooldownRecord.lastAttempt);
      const hours = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutes = Math.floor(
        (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
      );

      return interaction.reply({
        content: `🕒 Tu dois attendre encore **${hours}h ${minutes}min** avant de tenter un nouveau vol, tricheur !`,
      });
    }

    const user = await Economie.findOne({ where: { userId } });
    const target = await Economie.findOne({ where: { userId: targetUser.id } });

    if (!user || !target) {
      return interaction.reply({
        content: "L'un des deux membres n'a pas encore de compte !",
      });
    }

    if (target.pièces <= 0) {
      return interaction.reply({
        content: `🚫 Impossible de voler <@${targetUser.id}> qui est bien trop pauvre`,
      });
    }

    // Vérification si la cible a une protection anti-vol (itemId = 4)
    const protectionItemId = 4;
    const targetInventory = await Inventaire.findOne({
      where: { userId: targetUser.id, itemId: protectionItemId },
    });

    if (targetInventory && targetInventory.quantity > 0) {
      // Supprimer une unité de protection
      await Inventaire.decrement(
        { quantity: 1 },
        { where: { userId: targetUser.id, itemId: protectionItemId } }
      );

      // Vérifier si la quantité est tombée à 0 et supprimer l'entrée
      const updatedInventory = await Inventaire.findOne({
        where: { userId: targetUser.id, itemId: protectionItemId },
      });

      if (updatedInventory && updatedInventory.quantity <= 0) {
        await updatedInventory.destroy();
      }

      // Ajouter le cooldown de vol pour celui qui a lancé la commande
      await Cdvol.upsert({ userId, lastAttempt: now });

      return interaction.reply({
        content: `🚫 <@${targetUser.id}> était protégé par une **Protection anti-vol** ! Il l'a perdu, mais tu n'as rien volé. Tu as maintenant un cooldown de vol de **3 heures** !`,
      });
    }

    // Suite du code si la cible n'a pas de protection...
    const embed = new EmbedBuilder()
      .setTitle("💰 Tentative de vol 💰")
      .setDescription(
        "Choisis ton niveau de vol :\n\n" +
          "🔴 **Niveau 1 : Vol à main armée**\n" +
          "🟡 **Niveau 2 : Vol à l'arrachée**\n" +
          "🟢 **Niveau 3 : Optimisation fiscale**"
      )
      .setColor("#ff0000")
      .setFooter({ text: "Clique sur un bouton pour choisir !" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("vol_niveau_1")
        .setLabel("🔴 Niveau 1")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("vol_niveau_2")
        .setLabel("🟡 Niveau 2")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("vol_niveau_3")
        .setLabel("🟢 Niveau 3")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    // Création du collector après la réponse de l'interaction
    const collector = interaction.channel.createMessageComponentCollector({
      time: 15000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== userId) {
        return i.reply({
          content: "Ce choix ne t'appartient pas !",
          flags: MessageFlags.Ephemeral,
        });
      }

      let successChance, gainMin, gainMax, lossMax;

      if (i.customId === "vol_niveau_1") {
        successChance = 0.25;
        gainMin = 0;
        gainMax = 150;
        lossMax = 50;
      } else if (i.customId === "vol_niveau_2") {
        successChance = 0.5;
        gainMin = 0;
        gainMax = 90;
        lossMax = 30;
      } else {
        successChance = 0.65;
        gainMin = 0;
        gainMax = 30;
        lossMax = 10;
      }

      await i.update({
        content: "🦊 Teemo : *Tentative de vol en cours...*",
        components: [],
        embeds: [],
      });

      setTimeout(async () => {
        const isSuccess = Math.random() < successChance;
        let resultMessage = "";
        let stolenAmount = 0;

        if (isSuccess) {
          stolenAmount =
            Math.floor(Math.random() * (gainMax - gainMin + 1)) + gainMin;

          if (target.pièces < stolenAmount) {
            stolenAmount = target.pièces;
          }

          target.pièces -= stolenAmount;
          user.pièces += stolenAmount;

          await target.save();
          await user.save();

          resultMessage = `✅ Succès ! Tu as volé **${stolenAmount}** pièces à <@${targetUser.id}> !`;
        } else {
          let lossAmount = Math.floor(Math.random() * (lossMax + 1));
          user.pièces -= lossAmount;
          await user.save();

          resultMessage = `❌ Échec ! Tu as été attrapé et tu perds **${lossAmount}** pièces...`;
        }

        await Cdvol.upsert({ userId, lastAttempt: now });

        await interaction.editReply({
          content: resultMessage,
          components: [],
          embeds: [],
        });

        collector.stop();
      }, 4000);
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "⏳ Temps écoulé ! Tu n'as pas choisi de niveau à temps.",
          components: [],
          embeds: [],
        });
      }
    });
  },
};
