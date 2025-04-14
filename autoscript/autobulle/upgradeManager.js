const BulleUpgrade = require("../../Sequelize/modèles/argent/bulle/BubbleUpgrade");
const BulleUser = require("../../Sequelize/modèles/argent/bulle/BubbleUser");
const ENTREPRISES = require("../../utils/entreprises");

async function upgrade(userId, upgradeName) {
  const user = await BulleUser.findByPk(userId);
  if (!user) return "Utilisateur introuvable.";

  const entrepriseData = ENTREPRISES[user.entreprise];
  if (!entrepriseData) return "Ton entreprise actuelle n'est pas valide.";

  const upgradeData = entrepriseData.upgrades[upgradeName];
  if (!upgradeData)
    return "Cette amélioration n'existe pas à ton niveau actuel.";

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

// 👇 Pour générer dynamiquement les choix d'upgrades dans la commande
function getAllUpgradeChoices() {
  const allUpgrades = new Set();
  for (const entreprise of Object.values(ENTREPRISES)) {
    for (const upgradeName of Object.keys(entreprise.upgrades)) {
      allUpgrades.add(upgradeName);
    }
  }
  return Array.from(allUpgrades).map((name) => ({ name, value: name }));
}

module.exports = {
  upgrade,
  getAllUpgradeChoices,
};
