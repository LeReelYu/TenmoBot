const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const RouletteGame = require("../../Sequelize/modèles/russe"); // Importation du modèle

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roulette-russe")
    .setDescription("🎲 Vive le gambling avec sa vie !")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages), // Accessible à tous

  async execute(interaction) {
    const user = interaction.member;
    const username = user.displayName;
    const userId = user.id;

    // Récupérer l'état du chargeur de l'utilisateur
    let game = await RouletteGame.findOne({ where: { userId } });

    // Si aucun enregistrement, on initialise un nouveau chargeur
    if (!game) {
      game = await RouletteGame.create({ userId, remainingShots: 6 });
    }

    // Définir la probabilité de perte (1 balle mortelle dans le chargeur actuel)
    const roll = Math.floor(Math.random() * game.remainingShots) + 1;

    // Annonce du début du jeu
    await interaction.reply(
      `🔫 **${username} tente sa chance à la roulette de Bandle...**`
    );

    // Attente de 10 secondes
    await new Promise((resolve) => setTimeout(resolve, 10000));

    game.remainingShots--; // Décrémentation du chargeur

    if (roll === 1) {
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

        // Réinitialiser le chargeur après une perte
        await game.update({ remainingShots: 6 });
      } catch (error) {
        console.error("Erreur lors du mute :", error);
        await interaction.followUp({
          content: "❌ Impossible de te mute, je ne comprends pas !",
        });
      }
    } else {
      await interaction.followUp(
        `🎲 **${username} a reçu une balle... à blanc... Tu survis pour l'instant !**`
      );

      // Sauvegarde l'état du chargeur après un tir
      await game.save();
    }

    // Recharge automatique si le chargeur est vide
    if (game.remainingShots === 0) {
      await game.update({ remainingShots: 6 });
      await interaction.followUp(
        `🔄 **Le chargeur est vide ! Je m'en occupe**`
      );
    }
  },
};
