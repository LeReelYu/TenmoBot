module.exports = (client) => {
  client.on("messageCreate", (message) => {
    if (message.author.bot) return; // Ignore les messages des bots

    // Vérifie si le message contient un des mots-clés
    if (
      message.content.toLowerCase().includes("quoi") ||
      message.content.toLowerCase().includes("koi") ||
      message.content.toLowerCase().includes("kwa") ||
      message.content.toLowerCase().includes("quo.i") ||
      message.content.toLowerCase().includes("koa") ||
      message.content.toLowerCase().includes("kuwa") ||
      message.content.toLowerCase().includes("quooi") ||
      message.content.toLowerCase().includes("quuoi")
    ) {
      message.reply("feur");
    }
  });
};
