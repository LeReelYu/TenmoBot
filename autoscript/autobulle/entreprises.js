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
      "poignée d'élan": { baseCost: 50, effect: 1 }, // Clic upgrade spécifique à "à la sauvette"
      "étape rapide": { baseCost: 100, effect: 2 }, // Clic upgrade spécifique à "à la sauvette"
      "client fidèle": { baseCost: 200, effect: 3 }, // Clic upgrade spécifique à "à la sauvette"
      "passage express": { baseCost: 400, effect: 4 }, // Clic upgrade spécifique à "à la sauvette"
      "téléphone portable": { baseCost: 800, effect: 5 }, // Clic upgrade spécifique à "à la sauvette"
      "offre éclair": { baseCost: 1600, effect: 6 }, // Clic upgrade spécifique à "à la sauvette"
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
      "raccourci de vente": { baseCost: 100, effect: 2 }, // Clic upgrade spécifique à "stand ambulant"
      "publicité locale": { baseCost: 200, effect: 4 }, // Clic upgrade spécifique à "stand ambulant"
      "équipe réduite": { baseCost: 400, effect: 6 }, // Clic upgrade spécifique à "stand ambulant"
      "promotion rapide": { baseCost: 800, effect: 8 }, // Clic upgrade spécifique à "stand ambulant"
      "réduction éclair": { baseCost: 1600, effect: 10 }, // Clic upgrade spécifique à "stand ambulant"
      "deal exclusif": { baseCost: 3200, effect: 12 }, // Clic upgrade spécifique à "stand ambulant"
    },
    nextLevel: "boutique locale",
    upgradeReset: true,
    upgradeResetMessage: "Tu passes à un vrai commerce !",
    promotionCost: 150000,
  },
};

module.exports = ENTREPRISES;
