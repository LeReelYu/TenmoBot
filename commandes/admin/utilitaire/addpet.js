const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Pets = require("../../../Sequelize/modèles/argent/vente/animaux/pets");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addpet")
    .setDescription("Ajoute un nouveau pet au jeu (admin uniquement)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option.setName("name").setDescription("Nom du pet").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("rarity")
        .setDescription("Rareté du pet")
        .setRequired(true)
        .addChoices(
          { name: "Commun", value: "commun" },
          { name: "Rare", value: "rare" },
          { name: "Légendaire", value: "légendaire" },
          { name: "Mythique", value: "mythique" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("drop_rate")
        .setDescription("Taux de drop (ex: 0.05 pour 5%)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("image_url")
        .setDescription("URL de l'image du pet")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("effect_type")
        .setDescription("Type d'effet du pet (ex: vol, soin, xp_boost...)")
        .setRequired(false)
    )
    .addNumberOption((option) =>
      option
        .setName("max_quantity")
        .setDescription("Quantité maximale de ce pet disponible")
        .setRequired(false)
    ),

  async execute(interaction) {
    const name = interaction.options.getString("name");
    const rarity = interaction.options.getString("rarity");
    const image_url = interaction.options.getString("image_url") || null;
    const effect_type = interaction.options.getString("effect_type") || null;
    const drop_rate = interaction.options.getNumber("drop_rate");
    const max_quantity = interaction.options.getNumber("max_quantity") || null;

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "❌ Tu n'as pas la permission d'utiliser cette commande.",
      });
    }

    try {
      await Pets.create({
        name,
        rarity,
        image_url,
        effect_type,
        drop_rate,
        max_quantity,
      });

      return interaction.reply(`✅ Pet **${name}** ajouté avec succès !`);
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Une erreur est survenue lors de l'ajout du pet.",
      });
    }
  },
};
