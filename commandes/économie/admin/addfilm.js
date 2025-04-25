const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ListeFilms } = require("../../../Sequelize/modèles/listefilms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("majfilm")
    .setDescription("Ajoute un film à la base pour permettre la notation")
    .addStringOption((option) =>
      option
        .setName("titre")
        .setDescription("Titre exact du film à ajouter")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const titre = interaction.options.getString("titre");

    const existe = await ListeFilms.findOne({ where: { title: titre } });

    if (existe) {
      return interaction.reply({
        content: `❌ Le film **${titre}** est déjà enregistré.`,
      });
    }
    await ListeFilms.create({ title: titre });

    return interaction.reply({
      content: `✅ Le film **${titre}** a bien été ajouté à la base !`,
    });
  },
};
