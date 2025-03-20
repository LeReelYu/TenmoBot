const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const { deepl_api_key } = require("../../config.json"); // Importation de la clé API

module.exports = {
  data: new SlashCommandBuilder()
    .setName("traduction")
    .setDescription("Traduisez un texte dans la langue de votre choix.")
    .addStringOption((option) =>
      option
        .setName("texte")
        .setDescription("Le texte à traduire")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("langue")
        .setDescription(
          'La langue cible (ex: "EN" pour anglais, "FR" pour français)'
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const texte = interaction.options.getString("texte");
    const langue = interaction.options.getString("langue").toUpperCase();

    // URL de l'API DeepL
    const apiUrl = "https://api-free.deepl.com/v2/translate";

    try {
      // Faire la requête à l'API DeepL
      const response = await axios.post(apiUrl, null, {
        params: {
          auth_key: deepl_api_key, // Utilisation de la clé API depuis config.json
          text: texte,
          target_lang: langue,
        },
      });

      // Extraire le texte traduit de la réponse
      const translatedText = response.data.translations[0].text;

      // Mentionner la personne qui a lancé la commande
      const userMention = `<@${interaction.user.id}>`;

      // Répondre à l'utilisateur avec le texte traduit
      await interaction.reply({
        content: `${userMention}:"${texte}"\n${langue}: "${translatedText}"`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "Une erreur s'est produite lors de la traduction. Veuillez réessayer plus tard.",
        ephemeral: true,
      });
    }
  },
};
