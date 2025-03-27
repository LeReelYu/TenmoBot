module.exports = (client) => {
  // Liste des utilisateurs qui recevront forcément "feur"
  const guaranteedUsers = ["411559407349137413", "265130061210845184"]; // Remplace par les IDs

  // Liste des mots-clés déclencheurs
  const triggerWords = [
    "quoi",
    "koi",
    "kwa",
    "quo.i",
    "koa",
    "kuwa",
    "quooi",
    "quuoi",
    "quois",
    "qwa",
    "qoi",
    "koua",
    "quoa",
    "kwoi",
    "qwoa",
    "quoî",
    "quoï",
    "quôa",
    "quóa",
    "quòa",
    "kwä",
    "kwå",
    "qüoï",
    "quõi",
    "kwâ",
    "kwø",
    "qüa",
    "quøa",
    "quœ",
    "qöi",
    "kwæ",
    "kwó",
    "qüò",
    "qǫa",
    "quọa",
    "quₒa",
    "qᵘa",
    "𝗊𝗎𝗈𝗂",
    "𝖖𝖚𝖔𝖎",
    "𝒒𝒖𝒐𝒊",
    "𝘲𝘶𝘰𝘪",
    "𝓠𝓾𝓸𝓲",
    "ǪƱƠƖ",
    "ℚ𝕦𝕠𝕚✨",
    "𝔎𝔬𝔦💫",
    "𝒒𝒖𝒐𝒊🌙",
    "Ｋ𝕨𝕒💀",
    "Ǫ͙u̸o̸i̷",
    "𝕂𝕠𝕒🌀",
    "𝗞𝗼𝗶☁️",
    "𝕼𝖚𝖔𝖎🖤",
    "𝓚𝓸𝓪",
    "𝗾𝘂𝗼𝗶",
    "what",
    "q.ooi",
  ];

  client.on("messageCreate", (message) => {
    if (message.author.bot) return; // Ignore les bots

    // Vérifie si le message contient un des mots-clés
    if (
      triggerWords.some((word) => message.content.toLowerCase().includes(word))
    ) {
      if (guaranteedUsers.includes(message.author.id)) {
        // L'utilisateur est dans la liste -> il reçoit forcément "feur"
        message.reply("feur");
      } else if (Math.random() < 0.25) {
        // 25% de chance pour les autres utilisateurs
        message.reply("feur");
      }
    }
  });
};
