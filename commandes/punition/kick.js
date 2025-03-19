const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick un utilisateur du serveur")
    .addUserOption((option) =>
      option
        .setName("cible") // Correspond au nom de l'option dans la commande
        .setDescription("L'utilisateur à kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Raison du kick")
        .setRequired(false)
    ),
  async execute(interaction) {
    // Vérification que l'utilisateur a la permission de kick des membres
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content:
          "Vous devez avoir la permission de kick des membres pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const target = interaction.options.getMember("cible"); // Correction ici : utiliser "cible" pour obtenir le membre
    const reason =
      interaction.options.getString("raison") || "Aucune raison fournie"; // Correction ici : utiliser "raison" au lieu de "reason"

    // Vérifier si l'utilisateur existe
    if (!target) {
      return interaction.reply({
        content: "Utilisateur non trouvé.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Vérifier que la cible n'est pas l'auteur de la commande
    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: "Vous ne pouvez pas vous kicker vous-même.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Vérifier que la cible n'a pas un rôle plus élevé ou égal à celui de l'utilisateur
    if (
      target.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "Vous ne pouvez pas kick cette personne car elle a un rôle plus élevé.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Kick l'utilisateur
    try {
      await target.kick(reason);
      return interaction.reply({
        content: `${target.user.tag} a été kické pour la raison suivante : ${reason}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "Une erreur est survenue en tentant de kick cet utilisateur.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
