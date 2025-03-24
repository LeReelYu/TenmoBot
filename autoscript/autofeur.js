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
      message.content.toLowerCase().includes("quuoi") ||
      message.content.toLowerCase().includes("quois") ||
      message.content.toLowerCase().includes("qwa") ||
      message.content.toLowerCase().includes("qoi") ||
      message.content.toLowerCase().includes("koua") ||
      message.content.toLowerCase().includes("quoa") ||
      message.content.toLowerCase().includes("kwoi") ||
      message.content.toLowerCase().includes("qwoa") ||
      message.content.toLowerCase().includes("quoî") ||
      message.content.toLowerCase().includes("quoï") ||
      message.content.toLowerCase().includes("quôa") ||
      message.content.toLowerCase().includes("quóa") ||
      message.content.toLowerCase().includes("quòa") ||
      message.content.toLowerCase().includes("kwä") ||
      message.content.toLowerCase().includes("kwå") ||
      message.content.toLowerCase().includes("qüoï") ||
      message.content.toLowerCase().includes("quõi") ||
      message.content.toLowerCase().includes("kwâ") ||
      message.content.toLowerCase().includes("kwø") ||
      message.content.toLowerCase().includes("qüa") ||
      message.content.toLowerCase().includes("quøa") ||
      message.content.toLowerCase().includes("quœ") ||
      message.content.toLowerCase().includes("qöi") ||
      message.content.toLowerCase().includes("kwæ") ||
      message.content.toLowerCase().includes("kwó") ||
      message.content.toLowerCase().includes("qüò") ||
      message.content.toLowerCase().includes("qǫa") ||
      message.content.toLowerCase().includes("quọa") ||
      message.content.toLowerCase().includes("quₒa") ||
      message.content.toLowerCase().includes("qᵘa") ||
      message.content.toLowerCase().includes("𝗊𝗎𝗈𝗂") ||
      message.content.toLowerCase().includes("𝖖𝖚𝖔𝖎") ||
      message.content.toLowerCase().includes("𝒒𝒖𝒐𝒊") ||
      message.content.toLowerCase().includes("𝘲𝘶𝘰𝘪") ||
      message.content.toLowerCase().includes("𝓠𝓾𝓸𝓲") ||
      message.content.toLowerCase().includes("ǪƱƠƖ") ||
      message.content.toLowerCase().includes("ℚ𝕦𝕠𝕚✨") ||
      message.content.toLowerCase().includes("𝔎𝔬𝔦💫") ||
      message.content.toLowerCase().includes("𝒒𝒖𝒐𝒊🌙") ||
      message.content.toLowerCase().includes("Ｋ𝕨𝕒💀") ||
      message.content.toLowerCase().includes("Ǫ͙u̸o̸i̷") ||
      message.content.toLowerCase().includes("𝕂𝕠𝕒🌀") ||
      message.content.toLowerCase().includes("𝗞𝗼𝗶☁️") ||
      message.content.toLowerCase().includes("𝕼𝖚𝖔𝖎🖤") ||
      message.content.toLowerCase().includes("𝓚𝓸𝓪") ||
      message.content.toLowerCase().includes("𝗾𝘂𝗼𝗶")
    ) {
      message.reply("feur");
    }
  });
};
