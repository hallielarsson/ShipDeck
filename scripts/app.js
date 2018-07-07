var playCards = [];

let keys = Object.keys(baseCards);
for (var i = 0; i < 10; i++){
  let key = keys[i% keys.length];
  let newCard = Object.assign({}, baseCards[key]);
  playCards.push(newCard);
}

const store = new Vuex.Store({
  state: {
    health: 100,
    anxiety: 0,
    confidence: 100,
    vars: {},
  },
  mutations: {
    setHealth: (state, amount) => state.health = amount,
    damage: (state, amount) => state.health -= amount,
    heal: (state, amount) => state.health += amount,

    setAnxiety: (state, amount) => state.anxiety = amount,
    worry: (state, amount) => state.anxiety += amount,
    calm: (state, amount) => state.anxiety -= amount,

    setConfidence: (state, amount) => state.confidence = amount,
    succeed: (state, amount) => state.confidence.anxiety += amount,
    fail: (state, amount) => state.confidence.anxiety -= amount,
    setVar: (state, key, value) => state.varls[key] = value,
  },
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
    health: () => store.state.health,
    anxiety: () => store.state.anxiety,
    confidence: () => store.state.confidence,
  },
  methods: {
    playCard: function(card){
      if(this.currentCard && this.currentCard.resolved) {
        this.discard.push(this.cards.shift());
      }
      this.currentCard = this.cards[0];
      this.resolved = false;
      this.currentCard.effects(this.currentCard, this).then(() => this.resolved = true);
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
    damage: amount => store.commit('damage', amount),
    heal: amount => store.commit('heal', amount),
    worry: amount => store.commit('worry', amount),
    succeed: amount => store.commit('succeed', amount),
    fail: amount => store.commit('fail', amount),
    setVar: (key, value) => store.commit('setVar', key, value),
    
    //UI
    // This method is called by the card.
    message: function(message) {
      this.display_message += message;
    },
    // This method is called by the user (by pressing "Next").    
    userConfirm: function() {
      this.resolve();
    },
    // This method is called by the card.
    confirm: function(message){
      this.display_message += message;
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
