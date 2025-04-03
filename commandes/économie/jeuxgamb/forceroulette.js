const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Objets = require("../../../Sequelize/modèles/argent/objets"); // Modèle des objets
const Inventaire = require("../../../Sequelize/modèles/argent/inventaire"); // Modèle d'inventaire
const RusseGlobal = require("../../../Sequelize/modèles/russeglobal"); // Modèle de la roulette globale

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forceroulette")
    .setDescription(
      "Forcer l'exécution de la roulette globale sur un autre utilisateur"
    )
    .addUserOption((option) =>
      option
        .setName("cible")
        .setDescription(
          "L'utilisateur sur lequel appliquer la roulette globale"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.member;
    const targetUser = interaction.options.getUser("cible"); // La CIBLE de la roulette

    // Vérification de l'objet "Force roulette" dans l'inventaire de l'utilisateur
    const forceRouletteItem = await Objets.findOne({
      where: { id: 3 }, // Rechercher l'objet avec l'ID 3
    });

    if (!forceRouletteItem) {
      return interaction.reply({
        content: "L'objet 'Force roulette' n'existe pas dans la boutique.",
        ephemeral: true,
      });
    }

    // Vérification que l'utilisateur possède l'objet "Force roulette"
    const userInventory = await Inventaire.findOne({
      where: { userId: user.id, itemId: 3 }, // Recherche dans l'inventaire de l'utilisateur
    });

    if (!userInventory || userInventory.quantity < 1) {
      return interaction.reply({
        content: "Tu n'as pas l'objet 'Force roulette' dans ton inventaire.",
        ephemeral: true,
      });
    }

    // Réduire la quantité de l'objet "Force roulette" dans l'inventaire
    await Inventaire.update(
      { quantity: userInventory.quantity - 1 },
      { where: { userId: user.id, itemId: 3 } }
    );

    // Si la quantité est égale à 0, supprimer l'élément de l'inventaire
    if (userInventory.quantity - 1 === 0) {
      await Inventaire.destroy({
        where: { userId: user.id, itemId: 3 },
      });
    }

    // Maintenant, on lance la roulette globale avec le targetUser comme cible
    const game = await RusseGlobal.findOne({ where: {} });

    // Si aucun jeu existant, en créer un nouveau
    if (!game) {
      await RusseGlobal.create({ remainingShots: 6 });
    }

    // On génère les balles de la roulette (cela reste la même logique)
    const maxLostBalls = 3;
    const lostBallsCount = Math.floor(Math.random() * maxLostBalls) + 1;
    const balls = Array(game.remainingShots).fill("safe");
    for (let i = 0; i < lostBallsCount; i++) {
      const randomIndex = Math.floor(Math.random() * game.remainingShots);
      balls[randomIndex] = "lost";
    }

    // Message de début
    await interaction.reply(
      `🔫 **${user.displayName} a forcé la roulette globale sur ${targetUser.username}...** 🎰`
    );

    // Attente de 10 secondes (simule la tension)
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Décrémentation du chargeur global
    game.remainingShots--;

    // Tirer une balle pour la cible (targetUser)
    const rollResult = balls[game.remainingShots];

    if (rollResult === "lost") {
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.ModerateMembers
        )
      ) {
        return interaction.followUp({
          content: "❌ Je n'ai pas la permission de mute les membres !",
          ephemeral: true,
        });
      }

      if (!targetUser.moderatable) {
        return interaction.followUp(
          `🎲 **${targetUser.username} aurait perdu...** mais il a pris ses précautions !`
        );
      }

      // Appliquer le timeout sur la cible si elle perd
      try {
        await targetUser.timeout(60 * 1000, "Perdu à la roulette de Bandle !");
        await interaction.followUp(
          `🎲 **Oh non ${targetUser.username}... C'était une vraie balle... !**`
        );
      } catch (error) {
        console.error("Erreur lors du mute :", error);
        await interaction.followUp({
          content: "❌ Impossible de mute la cible, je ne comprends pas !",
        });
      }

      // Réinitialiser le chargeur après une perte
      await game.update({ remainingShots: 6 });
    } else {
      await interaction.followUp(
        `🎲 **${targetUser.username} a tiré une balle à blanc... Tu survis pour l'instant !**`
      );
    }

    // Sauvegarder l'état du chargeur
    await game.save();

    // Recharge automatique si le chargeur est vide
    if (game.remainingShots === 0) {
      await game.update({ remainingShots: 6 });
      await interaction.followUp(
        `🔄 Le chargeur est vide ! Je vais le recharger avec tout ce que j'ai !`
      );
    }
  },
};
