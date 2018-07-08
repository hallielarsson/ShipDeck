var playCards = [];

let keys = Object.keys(baseCards);
for (var i = 0; i < 10; i++){
  let key = keys[i% keys.length];
  let newCard = Object.assign({}, baseCards[key]);
  playCards.push(newCard);
}

function d(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function coinflip() {
  return Math.random() < 0.5;
}

const store = new Vuex.Store({
  state: {
    population: 100,
    acres: 1000,
    siloed: 2800,
    total_starved: 0,
  },
  mutations: {
    // Buy land with grain.
    buyLand: (state, payload) => { state.siloed -= payload.acres * payload.price_bushels_per_acre; state.acres += payload.acres; },
    // Sell land for grain.
    sellLand: (state, payload) => { state.acres -= payload.acres; state.siloed += payload.acres * payload.price_bushels_per_acre; },
    // Plant acres of land with seed.
    plant: (state, acres) => state.siloed -= acres / 2,
    // Harvest 1d6 times the number of acres planted.
    harvest: (state, acres) => state.siloed += acres * d(6),
    // Rats eat (1d6)th of the siloed grain.
    rats: (state) => state.siloed -= state.siloed / d(6),
    // Population increases.
    increase: (state) => state.population += state.population * d(6) * 0.01,
    // Plague kills half of the people.
    plague: (state) => state.population *= 0.5,
    // Feed bushels of grain to the people.
    feed: (state, bushels) => state.siloed -= bushels,
    // Starvation, due to feeding bushels of grain; each bushel eaten feeds 20 people for 1 year.
    starve: (state, bushels) => { if (state.population / 20 < bushels) { state.total_starved += state.population - bushels * 20; state.population = bushels * 20; } }
  }
})

var idleState = {
  name: "idle",
  enter: function(app, callback){
    callback();
  },
  leave: function(app, callback){
    callback();
  },
}


var playCardState = {
  name: "playCard",
  enter: function(app, callback){
    var card = app.currentCard;
    callback();
  },
  leave: function(app, callback){
    callback();
  },
}

var app = new Vue({
  el: "#app",
  data: {
    currentCard: null,
    state: null,
    display_message: "",
    transitionState: null,
    cards: playCards,
    discard: [],
    resolved: false,
  },
  computed: {
    population: () => store.state.population,
    acres: () => store.state.acres,
    siloed: () => store.state.siloed,
    total_starved: () => store.state.total_starved,
  },
  methods: {
    playCard: function(card){
      //if(this.currentCard && this.currentCard.resolved) {
        console.log("advancing to the next card");
        this.discard.push(this.cards.shift());
      //} else {
      //  console.log("not advancing to the next card");
      //}
      this.currentCard = this.cards[0];
      this.currentCard.resolved = false;
      this.currentCard.effects(this.currentCard, this).then(() => {
        console.log("effects are over");
        console.log(this);
        this.currentCard.resolved = true;
      });
      this.changeState(playCardState);
    },
    changeState: function(new_state, callback){
      console.log(`The state is changing, the new state is ${new_state.name}`);

      var self = this;
      if(self.transitionState){
        throw "Transitioning while already in transition unsupported.";
      }

      function finishLeaveCallback(){
        self.transitionState = new_state;
        self.state = new_state;
        self.state.enter(self, () => self.transitionState = null);
        if(callback){
          callback(self);
        }
      }

      if(self.state) {
        self.transitionState = self.state;
        self.state.leave(self, finishLeaveCallback);
      } else {
        finishLeaveCallback();
      }
    },

    buyLand: (acres, price_bushels_per_acre) => store.commit('buyLand', {acres: acres, price_bushels_per_acre: price_bushels_per_acre}),
    sellLand: (acres, price_bushels_per_acre) => store.commit('sellLand', {acres: acres, price_bushels_per_acre: price_bushels_per_acre}),
    plant: (acres) => store.commit('plant', acres),
    harvest: (acres) => store.commit('harvest', acres),
    rats: () => store.commit('rats'),
    increase: () => store.commit('increase'),
    plague: () => store.commit('plague'),
    feed: (bushels) => store.commit('feed', bushels),
    starve: (bushels) => store.commit('starve', bushels),
    
    //UI
    // This method is called by the card.
    message: function(message) {
      this.display_message += message;
    },
    // This method is called by the user (by pressing "Next").    
    userConfirm: function() {
      this.resolve();
    },
    // This method is called by the user (by pressing "Agree").    
    userAgree: function() {
      this.resolve(true);
    },
    // This method is called by the user (by pressing "Decline").    
    userDecline: function() {
      this.resolve(false);
    },
    // This method is called by the card.
    confirm: function(message){
      this.display_message = message;
      let resolve_exported;
      let reject_exported;
      let promise = new Promise((resolve, reject) => { 
        resolve_exported = resolve;
        reject_exported = reject;
      });
      this.resolve = resolve_exported;
      return promise;
    },
    // This method is called by the card.
    effect: function(which_effect){
      // TODO: dispatch on which_effect to do different things      
      let resolve_exported;
      let reject_exported;
      let promise = new Promise((resolve, reject) => { 
        resolve_exported = resolve;
        reject_exported = reject;
      });
      this.resolve = resolve_exported;
      return promise;
    },
    
  }
});

app.changeState(idleState);
