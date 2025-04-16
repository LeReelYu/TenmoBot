const BulleUpgrade = require("../../Sequelize/modèles/argent/bulle/BubbleUpgrade");
const BulleUser = require("../../Sequelize/modèles/argent/bulle/BubbleUser");
const ENTREPRISES = require("../autobulle/entreprises");

const upgrades = {
  // Clic upgrades pour "à la sauvette"
  "poignée d'élan": { baseCost: 50, effect: 1 },
  "étape rapide": { baseCost: 100, effect: 2 },
  "client fidèle": { baseCost: 200, effect: 3 },
  "passage express": { baseCost: 400, effect: 4 },
  "téléphone portable": { baseCost: 800, effect: 5 },
  "offre éclair": { baseCost: 1600, effect: 6 },

  // Clic upgrades pour "stand ambulant"
  "raccourci de vente": { baseCost: 100, effect: 2 },
  "publicité locale": { baseCost: 200, effect: 4 },
  "équipe réduite": { baseCost: 400, effect: 6 },
  "promotion rapide": { baseCost: 800, effect: 8 },
  "réduction éclair": { baseCost: 1600, effect: 10 },
  "deal exclusif": { baseCost: 3200, effect: 12 },
};

async function upgrade(userId, upgradeName) {
  const user = await BulleUser.findByPk(userId);
  if (!user) return "Utilisateur introuvable.";

  const entrepriseData = ENTREPRISES[user.entreprise];
  if (!entrepriseData) return "Ton entreprise actuelle n'est pas valide.";

  const upgradeData = entrepriseData.upgrades[upgradeName];
  if (!upgradeData)
    return "Cette amélioration n'existe pas à ton niveau actuel.";

  // Assurer que les upgrades sont spécifiques au niveau d'entreprise
  if (
    (user.entreprise === "à la sauvette" &&
      ![
        "poignée d'élan",
        "étape rapide",
        "client fidèle",
        "passage express",
        "téléphone portable",
        "offre éclair",
      ].includes(upgradeName)) ||
    (user.entreprise === "stand ambulant" &&
      ![
        "raccourci de vente",
        "publicité locale",
        "équipe réduite",
        "promotion rapide",
        "réduction éclair",
        "deal exclusif",
      ].includes(upgradeName))
  ) {
    return `Cette amélioration n'est pas disponible pour ton niveau actuel d'entreprise.`;
  }

  let userUpgrade = await BulleUpgrade.findOne({
    where: { userId, upgradeName },
  });

  const currentLevel = userUpgrade ? userUpgrade.level : 0;
  const cost = upgradeData.baseCost * (currentLevel + 1);

  if (user.bulles < cost) return `Tu n'as pas assez de bulles (coût: ${cost}).`;

  user.bulles -= cost;
  await user.save();

  if (userUpgrade) {
    userUpgrade.level++;
    await userUpgrade.save();
  } else {
    await BulleUpgrade.create({ userId, upgradeName, level: 1 });
  }

  return `Amélioration **${upgradeName}** passée au niveau **${
    currentLevel + 1
  }** !`;
}

module.exports = {
  upgrade,
  upgrades,
};
