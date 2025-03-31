const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Economie = require("../../Sequelize/modèles/argent/économie");
const daily = require("../../Sequelize/modèles/argent/daily");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Réclame ton argent quotidien !"),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Vérifier si l'utilisateur a réclamé son argent aujourd'hui
    const lastClaim = await daily.findOne({
      where: { userId: userId },
    });

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (lastClaim && new Date(lastClaim.lastClaimed) > yesterday) {
      // Si l'utilisateur a déjà réclamé l'argent aujourd'hui
      return interaction.reply(
        "Tu as déjà réclamé ton argent quotidien aujourd'hui ! Reviens demain, tricheur !"
      );
    }

    // Générer une quantité aléatoire de pièces entre 1 et 50
    const randomAmount = Math.floor(Math.random() * 50) + 1;

    // Ajouter des pièces à l'utilisateur
    const user = await Economie.findOne({
      where: { userId: userId },
    });

    if (user) {
      user.pièces += randomAmount; // L'utilisateur reçoit la quantité aléatoire de pièces
      await user.save();
    } else {
      // Si l'utilisateur n'a pas de compte, ne rien faire
      return interaction.reply(
        "Tu n'as pas encore de compte. Crée-en un d'abord avant de réclamer ton argent quotidien !"
      );
    }

    // Créer un tableau de messages aléatoires
    const messages = [
      "Reste fort comme Teemo ! 💪",
      "Aujourd'hui est un bon jour pour faire du jardinage rémunéré ! 🌱",
      "Rien ne vaut une bonne journée de travail sur l'île pour le grand capital 🌴",
      "N'oublie pas de faire une pause et de respirer avant de travailler dur 🌬️",
      "Ton aventure ici commence maintenant dans la grande entreprise qu'est la vie 🚀",
      "L'emoji pour ce message aurait dépassé le taux gratuit d'envoie du message",
      "Pour certains il vaut mieux être un cochon qu'un fasciste, j'ai fait mon choix 🐷",
      "Si je vis sur une île ce n'est vraiment pas pour les avantages fiscaux 💎",
      "Vous avez pas vu Locklear ? ⌚",
      "Les vagues peuvent être douces, mais les affaires sont toujours sérieuses ici ! Travaillons pour amasser des pièces ! 🌊💰",
      "Sous le soleil du lagon, chaque pièce compte. Ne les laisse pas s'envoler avec la brise ! 🌞💸",
      "Le lagon est magnifique, mais il est aussi plein d'opportunités. Plonge dans le travail pour récolter les pièces ! 🏝️💎",
      "Les coquillages ne vont pas s'accumuler tout seuls. Va à la pêche aux pièces aujourd'hui ! 🐚💰",
      "Construire un empire sur l'île prend du temps… et beaucoup de pièces. Rappelle-toi que chaque grain de sable compte ! 🏖️💵",
      "Les rêves de richesse ne se réalisent pas sous l'eau… mais avec un peu d'effort, tu feras des vagues avec tes pièces ! 🌊💡",
      "Si tu veux un bungalow sur la plage, il va falloir récolter des pièces... et quelques coquillages en chemin ! 🏠💰",
      "L'herbe est toujours plus verte à côté du lagon… mais n'oublie pas, chaque pièce est un pas vers la grandeur ! 🌱💸",
      "Ici, chaque coin du lagon cache une nouvelle opportunité. Saisis-la et remplis ton sac de pièces ! 🌴💰",
      "Rien ne tombe du ciel ici, pas même les pièces. Il te faudra plonger dans le travail pour les récolter ! 🌊💪",
      "Le lagon est calme, mais tes efforts peuvent faire déferler une vague de pièces sur toi ! 🌊",
      "Un peu de travail sous les palmiers et bientôt, tu auras assez de pièces pour acheter ton propre coin de paradis ! 🌴💰",
      "Les poissons ne nagent pas tout seuls, et les pièces ne tombent pas du ciel. Plonge pour les attraper ! 🐟💰",
      "Le lagon a ses charmes, mais la vraie richesse se trouve dans les pièces que tu collectes chaque jour ! 🏝️💸",
      "S'il y a une chose que l'on a ici, c'est le temps... et les pièces ! Profite-en pour travailler et amasser les deux ! 🕰️💰",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Sauvegarder l'heure de la dernière réclamation
    if (lastClaim) {
      lastClaim.lastClaimed = today;
      await lastClaim.save();
    } else {
      await daily.create({
        userId: userId,
        lastClaimed: today,
      });
    }

    // Créer l'embed de réponse avec le montant de pièces obtenu
    const embed = new EmbedBuilder()
      .setTitle(`Récompense quotidienne pour ${interaction.user.username}`)
      .addFields(
        {
          name: "Pièces reçues",
          value: `Tu as gagné **${randomAmount} pièces** aujourd'hui ! 💰`, // Afficher la quantité exacte de pièces
          inline: true,
        },
        {
          name: "Message du jour",
          value: randomMessage,
          inline: false,
        }
      )
      .setColor("#00b0f4")
      .setFooter({
        text: "Tom Nook",
        iconURL:
          "https://pbs.twimg.com/profile_images/1280368407586594817/bUqZkDDU_400x400.jpg",
      })
      .setTimestamp()
      .setImage(
        "https://i.pinimg.com/originals/fe/17/ac/fe17ace13977cf68caa7396ec448ca5f.gif"
      ); // Ajout de l'image directement sur l'embed

    await interaction.reply({ embeds: [embed] });
  },
};
