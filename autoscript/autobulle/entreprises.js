const ENTREPRISES = {
  "à la sauvette": {
    baseIncome: 10,
    upgrades: {
      tracts: { baseCost: 50, effect: 5 },
      clients: { baseCost: 100, effect: 10 },
      réseaux: { baseCost: 200, effect: 20 },
      "pub locale": { baseCost: 400, effect: 40 },
      mascotte: { baseCost: 800, effect: 80 },
      "vendeur bonus": { baseCost: 1600, effect: 160 },
    },
    nextLevel: "stand ambulant",
    upgradeReset: true,
    upgradeResetMessage:
      "Tu as abandonné la vente à la sauvette pour un stand flambant neuf !",
    promotionCost: 10000,
  },
  "stand ambulant": {
    baseIncome: 150,
    upgrades: {
      "enseigne lumineuse": { baseCost: 3000, effect: 150 },
      "musique d'ambiance": { baseCost: 6000, effect: 300 },
      "offres groupées": { baseCost: 12000, effect: 600 },
      "stand double": { baseCost: 24000, effect: 1200 },
      "sponsor local": { baseCost: 48000, effect: 2400 },
      "vendeur pro": { baseCost: 96000, effect: 4800 },
    },
    nextLevel: "boutique locale",
    upgradeReset: true,
    upgradeResetMessage: "Tu passes à un vrai commerce !",
    promotionCost: 150000,
  },
};

module.exports = ENTREPRISES;
