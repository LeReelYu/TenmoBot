const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const RusseGlobal = require("../../../Sequelize/modèles/russeglobal"); // Importation du modèle global

// Variable pour gérer le cooldown global
let isCooldownActive = false;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rouletteglobale")
    .setDescription("🎲 Roulette partagée pour tous les membres !")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages), // Accessible à tous

  async execute(interaction) {
    const user = interaction.member;
    const username = user.displayName;

    // Vérifier si le cooldown global est actif
    if (isCooldownActive) {
      return interaction.reply({
        content:
          "⏳ La roulette est en cours ! Attendez la fin avant de rejouer.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Activer le cooldown global
    isCooldownActive = true;

    // Récupérer l'état du chargeur global
    let game = await RusseGlobal.findOne({ where: {} });

    // Si aucun enregistrement, on initialise un nouveau chargeur global
    if (!game) {
      game = await RusseGlobal.create({ remainingShots: 6 });
    }

    // Définir un nombre aléatoire de balles perdantes (par exemple 1 à 3 balles perdues)
    const maxLostBalls = 3;
    const lostBallsCount = Math.floor(Math.random() * maxLostBalls) + 1;

    // Créer un tableau avec des balles sûres et perdues
    const balls = Array(game.remainingShots).fill("safe");
    for (let i = 0; i < lostBallsCount; i++) {
      const randomIndex = Math.floor(Math.random() * game.remainingShots);
      balls[randomIndex] = "lost";
    }

    // Annonce du début du jeu
    await interaction.reply(
      `🔫 **${username} tente sa chance à la roulette globale...** 🎰`
    );

    // Attente de 10 secondes
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Décrémentation des balles du chargeur global
    game.remainingShots--;

    // Tirer une balle (vérifier si elle est perdante)
    const rollResult = balls[game.remainingShots];

    if (rollResult === "lost") {
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.ModerateMembers
        )
      ) {
        isCooldownActive = false;
        return interaction.followUp({
          content: "❌ Je n'ai pas la permission de mute les membres !",
          ephemeral: true,
        });
      }

      if (!user.moderatable) {
        isCooldownActive = false;
        return interaction.followUp(
          `🎲 **${username} aurait perdu...** mais il a pris ses précautions !`
        );
      }

      try {
        await user.timeout(60 * 1000, "Perdu à la roulette de Bandle !");
        await interaction.followUp(
          `🎲 **Oh non ${username}... C'était une vraie balle... !**`
        );
      } catch (error) {
        console.error("Erreur lors du mute :", error);
        await interaction.followUp({
          content: "❌ Impossible de te mute, je ne comprends pas !",
        });
      }

      // Réinitialiser le chargeur après une perte
      await game.update({ remainingShots: 6 });
    } else {
      await interaction.followUp(
        `🎲 **${username} a tiré une balle à blanc... Tu survis pour l'instant !**`
      );
    }

    // Sauvegarde l'état du chargeur après un tir
    await game.save();

    // Recharge automatique si le chargeur est vide
    if (game.remainingShots === 0) {
      await game.update({ remainingShots: 6 });
      await interaction.followUp(
        `🔄 Le chargeur est vide ! Je vais le recharger avec tout ce que j'ai !`
      );
    }

    // Désactiver le cooldown global après la fin du jeu
    isCooldownActive = false;
  },
};
