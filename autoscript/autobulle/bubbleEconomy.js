const BulleUser = require("../../../Sequelize/modèles/argent/bulle/BubbleUser");
const BulleUpgrade = require("../../../Sequelize/modèles/argent/bulle/BubbleUpgrade");
const ENTREPRISES = require("./entreprises");

function calculateProduction(upgrades, entreprise = "à la sauvette") {
  const config = ENTREPRISES[entreprise];
  let total = config.baseIncome;
  for (const [name, level] of Object.entries(upgrades)) {
    const up = config.upgrades[name];
    if (up) total += up.effect * level;
  }
  return total;
}

async function collect(userId) {
  const user = await BulleUser.findByPk(userId);
  if (!user) return "Tu n'as pas de licence de vente de bulles.";

  const now = new Date();
  const last = user.lastCollect ? new Date(user.lastCollect) : null;
  if (last && now - last < 1000 * 60 * 30) {
    return `Tu dois attendre encore ${
      30 - Math.floor((now - last) / (1000 * 60))
    } minutes avant de collecter à nouveau.`;
  }

  const upgrades = await BulleUpgrade.findAll({ where: { userId } });
  const upgradeLevels = {};
  upgrades.forEach((up) => (upgradeLevels[up.upgradeName] = up.level));

  const amount = calculateProduction(upgradeLevels, user.entreprise);
  user.bulles += amount;
  user.totalBulles = (user.totalBulles || 0) + amount;
  user.lastCollect = now;
  await user.save();

  return `Tu as collecté ${amount} bulles.`;
}

async function convert(userId) {
  const user = await BulleUser.findByPk(userId);
  const Economie = require("../../../Sequelize/modèles/argent/économie");
  const eco = await Economie.findByPk(userId);

  if (!user || !eco || user.bulles <= 0) {
    return "Aucune bulle à convertir.";
  }

  const piècesGagnées = user.bulles;
  eco.pièces += piècesGagnées;
  user.bulles = 0;

  await eco.save();
  await user.save();

  return `${piècesGagnées} bulles ont été converties en ${piècesGagnées} pièces.`;
}

async function promoteEntreprise(userId) {
  const user = await BulleUser.findByPk(userId);
  if (!user)
    return { success: false, message: "Tu n'as pas encore de commerce." };

  const current = ENTREPRISES[user.entreprise];
  const next = ENTREPRISES[current.nextLevel];

  if (!next)
    return { success: false, message: "Tu es déjà au niveau maximum." };
  const Economie = require("../../../Sequelize/modèles/argent/économie");
  const eco = await Economie.findByPk(userId);

  if (eco.pièces < current.promotionCost) {
    return {
      success: false,
      message: `Il te faut ${current.promotionCost} pièces.`,
    };
  }

  eco.pièces -= current.promotionCost;
  user.entreprise = current.nextLevel;
  user.bulles = 0;
  await BulleUpgrade.destroy({ where: { userId } });

  await eco.save();
  await user.save();

  return {
    success: true,
    message: current.upgradeResetMessage,
  };
}

module.exports = {
  collect,
  convert,
  promoteEntreprise,
  calculateProduction,
};
