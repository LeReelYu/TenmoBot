const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField,
} = require("discord.js");
const Taglist = require("../../../Sequelize/modèles/taglist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("taglist")
    .setDescription("Gérer les mots interdits dans les pseudos")
    .addSubcommand((sub) =>
      sub
        .setName("ajouter")
        .setDescription("Ajouter un mot interdit")
        .addStringOption((opt) =>
          opt
            .setName("terme")
            .setDescription("Mot-clé à interdire")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("voir").setDescription("Voir tous les mots interdits")
    )
    .addSubcommand((sub) =>
      sub
        .setName("supprimer")
        .setDescription("Supprimer un mot interdit")
        .addStringOption((opt) =>
          opt
            .setName("terme")
            .setDescription("Mot-clé à retirer")
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
      const term = interaction.options.getString("terme").toLowerCase();

      const existing = await Taglist.findOne({ where: { term } });
      if (existing)
        return interaction.reply({
          content: "Ce terme est déjà interdit.",
          flags: MessageFlags.Ephemeral,
        });

      await Taglist.create({ term });

      const members = await interaction.guild.members.fetch();

      let notifyMessage = `🚫 Le terme "${term}" a été ajouté à la liste interdite.\n\nMembres concernés :\n`;

      let anyMemberNotified = false;

      members.forEach(async (member) => {
        const username = member.user.username.toLowerCase();
        let memberMessage = null;

        if (username.includes(term)) {
          memberMessage = `⚠️ **${member.user.tag}** a un pseudo contenant le terme interdit "${term}".`;
        }

        if (memberMessage) {
          anyMemberNotified = true;
          notifyMessage += `\n- ${memberMessage}`;
        }
      });

      if (anyMemberNotified) {
        await interaction.reply({
          content: notifyMessage,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: `🚫 Le terme "${term}" a été ajouté à la liste interdite, mais aucun membre n'a été trouvé avec ce terme dans son pseudo.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    if (sub === "voir") {
      const all = await Taglist.findAll();
      if (!all.length) return interaction.reply("Aucun terme interdit.");

      const list = all.map((tag) => `- ${tag.term}`).join("\n");
      return interaction.reply({
        content: `📋 Mots interdits :\n${list}`,
      });
    }

    if (sub === "supprimer") {
      const term = interaction.options.getString("terme").toLowerCase();
      const deleted = await Taglist.destroy({ where: { term } });

      if (!deleted)
        return interaction.reply({
          content: "Terme non trouvé.",
          flags: MessageFlags.Ephemeral,
        });

      return interaction.reply(`✅ Le terme "${term}" a été retiré.`);
    }
  },
};
