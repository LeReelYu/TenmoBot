const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const RusseGlobal = require("../../Sequelize/modèles/russeglobal"); // Importation du modèle global

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rouletteglobale")
    .setDescription("🎲 Roulette partagée pour tous les membres !")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages), // Accessible à tous

  async execute(interaction) {
    const user = interaction.member;
    const username = user.displayName;

    // Récupérer l'état du chargeur global
    let game = await RusseGlobal.findOne({ where: {} });

    // Si aucun enregistrement, on initialise un nouveau chargeur global
    if (!game) {
      game = await RusseGlobal.create({ remainingShots: 6 });
    }

    // Définir un nombre aléatoire de balles perdantes (par exemple 1 à 3 balles perdantes)
    const maxLostBalls = 3; // Maximum de balles perdantes
    const lostBallsCount = Math.floor(Math.random() * maxLostBalls) + 1; // Nombre de balles perdantes (1 à maxLostBalls)

    // Crée un tableau qui contient `lostBallsCount` balles perdantes
    const balls = Array(game.remainingShots).fill("safe"); // Par défaut, toutes les balles sont sûres
    for (let i = 0; i < lostBallsCount; i++) {
      const randomIndex = Math.floor(Math.random() * game.remainingShots); // Choisir une balle au hasard pour être perdante
      balls[randomIndex] = "lost"; // Marquer cette balle comme perdante
    }

    // Annonce du début du jeu
    await interaction.reply(
      `🔫 **${username} tente sa chance à la roulette de Bandle édition familiale...** 🎰`
    );

    // Attente de 10 secondes
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Décrémentation des balles du chargeur global
    game.remainingShots--;

    // Tirer une balle (vérifier si c'est une balle perdante)
    const rollResult = balls[game.remainingShots];

    if (rollResult === "lost") {
      // Vérifie si le bot a la permission de mute
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

      // Vérifie si l'utilisateur peut être mute
      if (!user.moderatable) {
        return interaction.followUp(
          `🎲 **${username} aurait perdu...** mais je vois que tu as pris tes précautions !`
        );
      }

      try {
        // Mute l'utilisateur pendant 60 secondes
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
  },
};
