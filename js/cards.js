var MOVE_RATE = 0.5;
var BASE_RATE = 1;
var CARD_WIDTH = 100;
var CARD_HEIGHT = 140;
var DECKX = CARD_WIDTH * 2;
var DECKY = CARD_HEIGHT * 4;
var CANVASX = 600;
var CANVASY = 700;
var FPS = 30;
var card_icon;
p5.disableFriendlyErrors = true;

function get_delta(start, end) {
    var delta = end - start;
    if (Math.abs(delta) < 1) {
        return delta;
    }

    if (delta > 0) {
        return BASE_RATE + MOVE_RATE * delta;
    } else if (delta < 0) {
        return -BASE_RATE+ MOVE_RATE * delta;
    } else {
        return 0;
    }
}

function grid_to_canvas(r, c) {
    return [CARD_WIDTH * c, CARD_HEIGHT * r];
}

function Card(x, y, id) {
    this.x = x;
    this.y = y;
    this.ex = x;
    this.ey = y;
    this.id = id;

    this.setDest = function(ex, ey) {
        this.ex = ex;
        this.ey = ey;
    }

    this.tick = function() {
        if (this.y != this.ey) {
            this.y += get_delta(this.y, this.ey);
        }
        if (this.x != this.ex) {
            this.x += get_delta(this.x, this.ex);
        }
    }

    this.render = function(p) {
        p.fill(244, 66, 101);
        // rect(this.x, this.y, 50, 70);
        p.image(card_icon, this.x, this.y, CARD_WIDTH, CARD_HEIGHT)

        p.textSize(32);
        p.fill(60);
        p.textAlign(p.CENTER)
        p.text(this.id, this.x + CARD_WIDTH / 2, this.y + CARD_HEIGHT / 2);
        p.noFill();
    }

    this.isDone = function () {
        return this.y == this.ey && this.x == this.ex;
    }
}

function deal(grid, deck, step, map) {
    var card = deck.pop();
    var dest = map(step);
    var row  = dest[0];
    var col = dest[1];
    var canvas_dest = grid_to_canvas(row, col);
    card.setDest(canvas_dest[0], canvas_dest[1]);
    grid[row][col] = card;

}

function pickup(grid, deck, step, map) {
    var dest = map(step);
    var row = dest[0];
    var col = dest[1];
    var card = grid[row][col];
    card.setDest(DECKX, DECKY);
    deck.unshift(card);
    grid[row][col] = null;
}

//operations that can be performed on cards and collections of cards
function row_deal(grid, deck, step) {
    deal(grid, deck, step, function(s) {return [Math.floor(s / 5), s % 5]});
}

function row_pickup(grid, deck, step) {
    pickup(grid, deck, step, function(s) {return [Math.floor(s / 5), s % 5]});
}

function col_deal(grid, deck, step) {
    deal(grid, deck, step, function(s) {return [s % 3, Math.floor(s / 3)]});
}

function col_pickup(grid, deck, step) {
    pickup(grid, deck, step, function(s) {return [s % 3, Math.floor(s / 3)]});
}

function diag_deal(grid, deck, step) {
    deal(grid, deck, step, function(s) {return [s % 3, s % 5]});
}

function diag_pickup(grid, deck, step) {
    pickup(grid, deck, step, function(s) {return [s % 3, s % 5]});
}

function deck_init(animation) {
    var count = 0;
    for (var r = 0; r < 3; r++) {
        var row = Array(5);
        for (var c = 0; c < 5; c++) {
            var card = new Card(DECKX, DECKY, '' + count);
            //register with animation
            animation.card_map[count] = card;
            animation.cards.push(card);
            animation.deck.unshift(card);
            count += 1;
        }
        animation.grid.push(row);
    }
}

function grid_init(animation) {
    var count = 0;
    for (var r = 0; r < 3; r++) {
        var row = Array(5);
        for (var c = 0; c < 5; c++) {
            var dest = grid_to_canvas(r, c);
            var card = new Card(dest[0], dest[1], '' + count);
            //register with animation
            animation.cards.push(card);
            row[c] = card;
            count += 1;
        }
        animation.grid.push(row);
    }
}


//Constructor takes in an setup function for cards
//and an array of subsequent animation operations
function CardAnimation(init_function, operations) {
    this.cards = [];
    this.card_map = {};
    this.deck = [];
    this.grid = [];
    this.STATE = 0;
    this.step = 0;

    //get access to the object scope
    var animation = this;

    this.sketch = function(p) {
       p.setup = function() {
            p.createCanvas(CANVASX, CANVASY);
            p.frameRate(FPS);
            //todo
            card_icon = p.loadImage("card.png");
            init_function(animation);
            console.log(animation.grid);
        };

        p.draw = function() {
            p.clear();
            animation.cards.forEach(function(e) {e.render(p)});
            animation.deck.forEach(function(e) {e.render(p)});
            animation.cards.forEach(function(e) {e.tick()});

            if (animation.cards.every(function(e) {return e.isDone()})) {
                operations[animation.STATE](animation.grid, animation.deck, animation.step);
                animation.step += 1;
            }

            if (animation.step == 15) {
                animation.STATE = (animation.STATE + 1) % operations.length;
                animation.step = 0;
            }
        };

    }
}


var alpha_animation = new CardAnimation(grid_init, [row_pickup, diag_deal]);
var alpha_sketch = new p5(alpha_animation.sketch, "alpha");

var beta_animation = new CardAnimation(grid_init, [col_pickup, diag_deal]);
var beta_sketch = new p5(beta_animation.sketch, "beta");

var gamma_animation = new CardAnimation(grid_init, [row_pickup, col_deal]);
var gamma_sketch = new p5(gamma_animation.sketch, "gamma");

var row_animation = new CardAnimation(deck_init, [row_deal, row_pickup]);
var row_sketch = new p5(row_animation.sketch, "row-card");

var col_animation = new CardAnimation(deck_init, [col_deal, col_pickup]);
var col_sketch = new p5(col_animation.sketch, "col-card");

var diag_animation = new CardAnimation(deck_init, [diag_deal, diag_pickup]);
var diag = new p5(diag_animation.sketch, "diag-card");

