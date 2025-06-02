const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute un utilisateur pendant un certain temps")
    .addUserOption((option) =>
      option
        .setName("cible")
        .setDescription("L'utilisateur à muter")
        .setRequired(true)
    )
    .addIntegerOption(
      (option) =>
        option
          .setName("durée")
          .setDescription("Durée du mute en secondes")
          .setRequired(true)
          .setMinValue(1) // Durée minimale de 1 seconde
    ),
  async execute(interaction) {
    // Vérification que l'utilisateur a la permission de muter des membres
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    ) {
      return interaction.reply({
        content:
          "Vous devez avoir la permission de muter les membres pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const target = interaction.options.getMember("cible"); // L'utilisateur à muter
    const duration = interaction.options.getInteger("durée") * 1000; // Convertir la durée en millisecondes

    // Vérifier si l'utilisateur existe
    if (!target) {
      return interaction.reply({
        content: "Utilisateur non trouvé.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Vérifier que l'utilisateur cible n'a pas un rôle supérieur ou égal à celui de l'utilisateur appelant
    if (
      target.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "Vous ne pouvez pas muter cette personne car elle a un rôle plus élevé.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Mute l'utilisateur
    try {
      await target.timeout(duration, "Mute temporaire"); // Appliquer le timeout (mute temporaire)

      return interaction.reply({
        content: `${target.user.tag} a été mute pour ${
          duration / 1000
        } secondes.`,
        flags: MessageFlags.Ephemeral, // Message privé pour l'utilisateur qui a lancé la commande
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "Une erreur est survenue en tentant de mute cet utilisateur.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
