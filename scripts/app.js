function MakeCards() {
  var cards = [];
  cards.push(new Card({
    name: "It's Found You!",
    description: "You can feel it breathing",
    userdata: { found: 0, hid: 0},
    effects: [
      function (card, app, done){
        app.worry(Math.ceil(Math.random() * 10));
        card.name = "It's Found You?",
        card.description = "You can't handle this.";
        done();
      },
      function(card, app, done){
        app.worry(3);
        var hid = card.userdata.hid;
        var found = card.userdata.found;
        if(Math.random() > (0.5 + found / (found + hid))) {
          card.userdata.hid++;
          card.name = "... Or Maybe It Hasn't"
          card.description = "You'll never believe it's gone.";
          card.resolved = true;
          card.isFinished = true;
        };
        done();
      }
    ],
  }));

  cards.push(new Card({
    name: "Health Pack",
    description: "You find a white box.",
    userdata: {},
    effects: [
      function (card, app, done){
        app.heal(Math.ceil(Math.random() * 10));
        card.description = "You feel a little better.";
        card.resolved = true;
        done();
      },
    ],
  }));

  cards.push(new Card({
    name: "Two Doors",
    description: "There are two doors in front of you.",
    userdata: {},
    effects: [
      function (card, app, done){
        card.description = "You take the left.";
        card.resolved = true;
        done();
      },
    ],
  }));
  return cards;
}


function Card({name, description, effects, userdata}){
  this.effectsIndex = 0;
  this.name = name;
  this.description = description;
  this.initialText = description;
  this.effects = effects;
  this.resolved = false;
  this.userdata = userdata;
}
Card.prototype = {
  reset(){
    this.effectsIndex = 0;
    this.initialText = 0;
    this.resolved = false;
  },
  playNextEffect: function(app, callback){
    var self = this;
    var card = this;
    var currentEffect = card.effects[self.effectsIndex];

    currentEffect(card, app, callback);
    card.effectsIndex++;
    if(card.effectsIndex == card.effects.length){
      card.resolved = true;
    }
  },
  getPlayable: function(){
    return new Card({
      name: this.name,
      description: this.description,
      effects: this.effects,
      userdata: this.userdata
    })
  }
}

cards = MakeCards();

playCards = [];

for (var i = 0; i < 100; i++){
  var newCard = cards[i % cards.length].getPlayable();
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
    succeed: (state, amount) => confidence.anxiety += amount,
    fail: (state, amount) => confidence.anxiety -= amount,
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
    transitionState: null,
    cards: playCards,
    discard: cards,
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

      this.changeState(playCardState);
    },
    changeState: function(new_state, callback){
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
    cardEffectStep: function(){
      var card = this.currentCard;
      if(!card.resolved){
        this.midStep = true;
        card.playNextEffect(this, () => this.midStep = false);
      }
    },
    damage: amount => store.commit('damage', amount),
    heal: amount => store.commit('heal', amount),
    worry: amount => store.commit('worry', amount),
    succeed: amount => store.commit('succeed', amount),
    fail: amount => store.commit('fail', amount),
    setVar: (key, value) => store.commit('setVar', key, value)
  }

});

app.changeState(idleState);
