const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField,
} = require("discord.js");
const Blacklist = require("../../../Sequelize/modèles/blacklist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Gérer les utilisateurs blacklistés")
    .addSubcommand((sub) =>
      sub
        .setName("ajouter")
        .setDescription("Ajouter un utilisateur à la blacklist")
        .addStringOption((opt) =>
          opt
            .setName("utilisateur")
            .setDescription("Mention, ID ou tag de l'utilisateur")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("raison")
            .setDescription("Raison de la blacklist")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("voir")
        .setDescription("Voir tous les utilisateurs blacklistés")
    )
    .addSubcommand((sub) =>
      sub
        .setName("supprimer")
        .setDescription("Supprimer un utilisateur de la blacklist")
        .addStringOption((opt) =>
          opt
            .setName("utilisateur")
            .setDescription("Mention, ID ou tag de l'utilisateur")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return interaction.reply({
        content: "🚫 Vous n'avez pas la permission d'utiliser cette commande",
        flags: MessageFlags.Ephemeral,
      });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "ajouter") {
      const input = interaction.options.getString("utilisateur");
      const reason = interaction.options.getString("raison") || "Non spécifiée";

      let userId = null;
      let username = "Inconnu";

      // Traitement de l'entrée utilisateur (mention, ID, tag)
      const mentionMatch = input.match(/^<@!?(\d+)>$/);
      if (mentionMatch) {
        userId = mentionMatch[1];
      } else if (/^\d{17,20}$/.test(input)) {
        userId = input;
      } else {
        const found = interaction.client.users.cache.find(
          (u) => u.tag === input
        );
        if (found) userId = found.id;
      }

      if (!userId) {
        return interaction.reply({
          content: `❌ Impossible d’interpréter \`${input}\` comme un ID, une mention ou un tag valide.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      try {
        const user = await interaction.client.users.fetch(userId);
        username = user.tag;
      } catch (e) {
        username = `Inconnu (ID: ${userId})`;
      }

      const existing = await Blacklist.findOne({ where: { userID: userId } });
      if (existing) {
        return interaction.reply({
          content: "Utilisateur déjà blacklisté.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await Blacklist.create({
        userID: userId,
        username,
        reason,
      });

      return interaction.reply(
        `✅ L'utilisateur **${username}** (ID: ${userId}) a été blacklisté.\n📝 Raison : ${reason}`
      );
    }

    if (sub === "voir") {
      const all = await Blacklist.findAll();
      if (!all.length)
        return interaction.reply("Aucun utilisateur blacklisté.");

      const list = all
        .map(
          (entry) =>
            `- **${entry.username}** (ID: ${entry.userID}) → Raison : _${entry.reason}_`
        )
        .join("\n");

      return interaction.reply({
        content: `📋 Utilisateurs blacklistés :\n${list}`,
      });
    }

    if (sub === "supprimer") {
      const input = interaction.options.getString("utilisateur");
      let userId = null;
      let username = "Inconnu";

      const mentionMatch = input.match(/^<@!?(\d+)>$/);
      if (mentionMatch) {
        userId = mentionMatch[1];
      } else if (/^\d{17,20}$/.test(input)) {
        userId = input;
      } else {
        const found = interaction.client.users.cache.find(
          (u) => u.tag === input
        );
        if (found) userId = found.id;
      }

      if (!userId) {
        return interaction.reply({
          content: `❌ Impossible d’interpréter \`${input}\` comme un ID, une mention ou un tag valide.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      try {
        const user = await interaction.client.users.fetch(userId);
        username = user.tag;
      } catch (e) {
        username = `ID: ${userId}`;
      }

      const deleted = await Blacklist.destroy({ where: { userID: userId } });

      if (!deleted) {
        return interaction.reply({
          content: "Utilisateur non trouvé dans la blacklist.",
          flags: MessageFlags.Ephemeral,
        });
      }

      return interaction.reply(
        `❌ L'utilisateur **${username}** a été retiré de la blacklist.`
      );
    }
  },
};
