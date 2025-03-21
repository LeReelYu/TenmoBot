/*const axios = require("axios");

module.exports = async function handleMessage(client, message) {
  if (message.author.bot) return; // Ignore les bots

  // Vérifie si le bot est mentionné
  if (message.mentions.has(client.user)) {
    const question = message.content.replace(`<@${client.user.id}>`, "").trim();
    if (!question) return; // Ignore si juste une mention sans texte

    // Affiche dans le terminal le prompt envoyé à Ollama
    console.log(`📝 Prompt envoyé à Ollama: "${question}"`);

    await message.channel.sendTyping(); // Simule la saisie du bot

    try {
      const response = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3", // Modèle utilisé
        prompt: `Réponds de manière humoristique à cette question comme si tu étais le capitaine teemo de league of legends : ${question}`, // Demander une réponse humoristique
        stream: false,
      });

      const aiResponse = response.data.response;
      await message.reply(`🤖 **Llama 3:** ${aiResponse}`);
    } catch (error) {
      console.error("❌ Erreur avec Ollama :", error.message);
      await message.reply("❌ Une erreur est survenue avec l'IA.");
    }
  }
};
*/
// Bon j'ai scellé ollama.js et sa partie démarrage dans ready jusqu'à voir la puissance du pc.
