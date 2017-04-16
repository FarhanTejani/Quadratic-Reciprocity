var MOVE_RATE = 0.12;
var CARD_WIDTH = 100;
var CARD_HEIGHT = 140;
var DECKX = CARD_WIDTH * 2;
var DECKY = CARD_HEIGHT * 4;
var card_icon;
p5.disableFriendlyErrors = true;

function get_delta(start, end) {
    var delta = end - start;
    if (Math.abs(delta) < 1) {
        return delta;
    }

    if (delta > 0) {
        return 1 + MOVE_RATE * delta;
    } else if (delta < 0) {
        return -1 + MOVE_RATE * delta;
    } else {
        return 0;
    }
}

function grid_to_canvas(r, c) {
    return [CARD_WIDTH * c, CARD_HEIGHT * r];
}

function canvas_to_grid(x, y) {
    return [x / 60, y / 80];
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


function row_deal(card_map, grid, deck, cards, i) {
    var card = deck.pop();
    var r = Math.floor(i / 5);
    var c = i % 5;
    var dest = grid_to_canvas(Math.floor(i / 5), i % 5);
    card.setDest(dest[0], dest[1]);
    grid[r][c] = card;
}

function row_pickup(card_map, grid, deck, cards, i) {
    var r = Math.floor(i / 5);
    var c = i % 5;
    var card = grid[r][c]
    card.setDest(DECKX, DECKY);
    deck.unshift(card);
    grid[r][c] = null;
}




var row_sketch_canvas = function (p) {
    var cards = [];
    var card_map = {}
    var grid = Array(3);
    var deck = [];

    p.setup = function() {
        p.createCanvas(800, 800);
        var count = 0;
        for (var r = 0; r < 3; r++) {
            var row = Array(5);
            for (var c = 0; c < 5; c++) {
                //deck init
                var card = new Card(DECKX, DECKY, '' + count);
                card_map[count] = card;
                count += 1;
                cards.push(card);
                deck.unshift(card);

                //grid init
                // var dest = grid_to_canvas(r, c);
                // var card = new Card(dest[0], dest[1], '' + count);
                // cards.push(card);
                // row[c] = card;
                // count += 1;

            }
            grid[r] = row;
         }
        card_icon = p.loadImage("card.png");
    };


    var step = 0;
    var STATE = 0

    p.draw = function () {
        p.clear();
        cards.forEach((e) => {e.render(p)});
        deck.forEach((e) => {e.render(p)});

        cards.forEach((e) => {e.tick()});
        if (STATE == 0) {
            if (cards.every((e) => {return e.isDone()})) {
                row_deal(card_map, grid, deck, cards, step);
                step += 1
            }
        } else if (STATE == 1) {
            if (cards.every((e) => {return e.isDone()})) {
                row_pickup(card_map, grid, deck, cards, step);
                step += 1;
            }
        }
        if (step == 15) {
            STATE = (STATE + 1) % 2;
            step = 0;
        }
    };
}

var col_sketch_canvas = function (p) {
    var cards = [];
    var card_map = {}
    var grid = Array(3);
    var deck = [];

    p.setup = function() {
        p.createCanvas(800, 800);
        var count = 0;
        for (var r = 0; r < 3; r++) {
            var row = Array(5);
            for (var c = 0; c < 5; c++) {
                //deck init
                var card = new Card(DECKX, DECKY, '' + count);
                card_map[count] = card;
                count += 1;
                cards.push(card);
                deck.unshift(card);
            }
            grid[r] = row;
         }
        card_icon = p.loadImage("card.png");
    };


    var step = 0;
    var STATE = 0

    p.draw = function () {
        p.clear();
        cards.forEach((e) => {e.render(p)});
        deck.forEach((e) => {e.render(p)});
        cards.forEach((e) => {e.tick()});

        if (cards.every((e) => {return e.isDone()})) {
            row_deal(card_map, grid, deck, cards, step);
            step += 1
        }
    };
}

var row_sketch = new p5(row_sketch_canvas, "test");
var col_sketch = new p5(col_sketch_canvas, "test2");
