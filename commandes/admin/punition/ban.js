const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban un utilisateur du serveur")
    .addUserOption((option) =>
      option
        .setName("cible") // Nom de l'option pour la cible
        .setDescription("L'utilisateur à bannir")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison") // Nom de l'option pour la raison
        .setDescription("Raison du ban")
        .setRequired(false)
    ),
  async execute(interaction) {
    // Vérification que l'utilisateur a la permission de ban des membres
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return interaction.reply({
        content:
          "Vous devez avoir la permission de bannir des membres pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral, // Utilisation correcte de MessageFlags.Ephemeral
      });
    }

    const target = interaction.options.getMember("cible"); // L'utilisateur à bannir
    const reason =
      interaction.options.getString("raison") || "Aucune raison fournie"; // Raison par défaut si aucune raison n'est donnée

    // Vérifier si l'utilisateur existe
    if (!target) {
      return interaction.reply({
        content: "Utilisateur non trouvé.",
        flags: MessageFlags.Ephemeral, // Utilisation correcte de MessageFlags.Ephemeral
      });
    }

    // Vérifier que la cible n'est pas l'auteur de la commande
    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: "Vous ne pouvez pas vous bannir vous-même.",
        flags: MessageFlags.Ephemeral, // Utilisation correcte de MessageFlags.Ephemeral
      });
    }

    // Vérifier que la cible n'a pas un rôle plus élevé ou égal à celui de l'utilisateur
    if (
      target.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "Vous ne pouvez pas bannir cette personne car elle a un rôle plus élevé.",
        flags: MessageFlags.Ephemeral, // Utilisation correcte de MessageFlags.Ephemeral
      });
    }

    // Bannir l'utilisateur
    try {
      await target.ban({ reason }); // Bannir l'utilisateur avec la raison fournie
      return interaction.reply({
        content: `${target.user.tag} a été banni pour la raison suivante : ${reason}`,
        flags: MessageFlags.Ephemeral, // Utilisation correcte de MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content:
          "Une erreur est survenue en tentant de bannir cet utilisateur.",
        flags: MessageFlags.Ephemeral, // Utilisation correcte de MessageFlags.Ephemeral
      });
    }
  },
};
