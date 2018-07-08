//Not in use yet -- this is just the desired data spec

var baseCards = {
  "rats" : {
    name: "Rats are running wild!",
    description: "Rats are eating grain from the siloes.",
    tags: [],
    userdata: {},
    
    effects: async (card, app) => {
      app.rats();
      await app.confirm(`Rats ate ?? bushels.`);
      return "done";
    }
  },
  "plague" : {
    name: "Plague",
    description: "Death's silo reaps the people like grain.",
    tags: [],
    userdata: {},
    
    effects: async (card, app) => {
      app.plague();
      await app.confirm(`Plague killed ?? people.`);
      return "done";
    }
  },
  "year" : {
    name: "Turning of the Seasons",
    description: "The seasons have passed, and it is now time to decide what fraction of the people will eat, and how many acres should be planted.",
    tags: [],
    userdata: {},
    
    effects: async (card, app) => {
      let bushels_fed = 100 * d(6);
      await app.confirm(`Feed ${bushels_fed} bushels to the population?`);
      app.feed(bushels_fed);
      let acres_planted = 100 * d(6);
      await app.confirm(`Plant ${acres_planted} acres of land?`);
      app.plant(acres_planted);
      await app.confirm(`Harvested ?? bushels`);
      app.harvest(acres_planted);
      await app.confirm(`Population increased by ?? people`);
      app.increase();
      app.starve(bushels_fed);
      await app.confirm(`?? people starved.`)
      return "done";
    }
  }
  "buyLandSmall" : {
    name: "A neighborly offer",
    description: "A neighboring high priest offers to sell you some disputed land for grain.",
    tags: [],
    userdata: {},

    effects: async (card, app) => {
      let amount = 100 * d(6);
      let price = 17 + d(10);
      let approved = await app.confirm(`Buy ${amount} acres of land for ${price} bushels per acre?`)
      if (approved) {
        app.buyLand(amount, price);
      }
      return "done";
    }
  },
  "buyLandLarge" : {
    name: "A bold purchase",
    description: "Rescue a starving neighbor, and extract territorial gains in return.",
    tags: [],
    userdata: {},

    effects: async (card, app) => {
      let amount = 300 * d(6);
      let price = 17 + d(10);
      let approved = await app.confirm(`Buy ${amount} acres of land for ${price} bushels per acre?`)
      if (approved) {
        app.buyLand(amount, price);
      }
      return "done";
    }
  },
  "sellLandSmall" : {
    name: "Conceed some land",
    description: "A neighboring high priest offers to sell you some grain for some undesirable land.",
    tags: [],
    userdata: {},

    effects: async (card, app) => {
      let amount = 100 * d(6);
      let price = 17 + d(10);
      let approved = await app.confirm(`Sell ${amount} acres of land for ${price} bushels per acre?`)
      if (approved) {
        app.sellLand(amount, price);
      }
      return "done";
    }
  },
  "buyLandLarge" : {
    name: "Beg for assistance",
    description: "Ask humbly for assistance from a neighbor, and give up territory in exchange.",
    tags: [],
    userdata: {},

    effects: async (card, app) => {
      let amount = 300 * d(6);
      let price = 17 + d(10);
      let approved = await app.confirm(`Sell ${amount} acres of land for ${price} bushels per acre?`)
      if (approved) {
        app.sellLand(amount, price);
      }
      return "done";
    }
  },
};