

var baseCards = {
  "found" : {
    name: "It's Found You!",
    description: "You can feel it breathing",
    tags: ["danger", "monster"];
    userdata: { found: 0, hid: 0},
    effects: [
      function (card, app, done){
        app.worry(Math.ceil(Math.random() * 10));
        card.name = "It's Found You?",
        card.message("You can't handle this.");
        done();
      },
      function(card, app, done){
        app.worry(3);
        var hid = card.get("hid");
        var found = card.get("found");
        if(Math.random() > (0.5 + found / (found + hid))) {
          card.set("hid", hid + 1);
          card.name = "... Or Maybe It Hasn't"
          card.message("You'll never believe it's gone.");
          card.resolved = true;
          card.isFinished = true;
        };
        done();
      }
    ],
  },
  "find_health" : {
    name: "Health Pack",
    description: "You find a white box.",
    tags: ["heal"],
    userdata: {uses: 10},
    effects: [
      function (card, app, done){
        app.heal(Math.ceil(Math.random() * 10));
        if(card.get("uses") > 1 ){
          app.message("")
        }
        card.message ("You feel a little better.");
        card.resolved = true;
        app.exhaust(card);
        done();
      },
    ],
  },

};