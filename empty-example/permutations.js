var FPS = 30;
var P_SPACE = 75;
var V_SPACE = 150
var DIM = 5;



function get_not_done(map, dim, done) {
    for (var i = 1; i < dim + 1; i++) {
        if (!done.has(i) && map[i]) {
            return i;
        }
    }
    return -1;
}

function follow_cycles(map, dim) {
    var done = new Set();
    var total = Object.keys(map).length
    cycles = [];
    while (done.size != total) {
        i = get_not_done(map, dim, done);
        cycle = [];
        current = map[i];
        cycle.push(i);
        done.add(i);
        while (current != i) {
            cycle.push(current);
            done.add(current);
            current = map[current];
        }
        cycles.push(cycle);
    }
    return cycles
}

function Permutation(map, dim, x, y, p) {
    // this.map = map;
    this.p = p;
    this.map = map;
    this.dim = dim;
    this.drawing = false;
    this.origin = 0;
    this.x = x;
    this.y = y;
    this.lx = 0;
    this.ly = 0;
    this.magic = 0;
    this.sign_override = 0;

    // this.convert = function(p)

    this.get_x = function(i) {
        return this.x + i * P_SPACE
    }

    this.shift_y = function(y) {
        return y + this.y
    }

    this.render = function (p) {
        // p.strokeWeight(4);
        for (var i = 0; i < dim; i++) {
            sx = this.get_x(i + 1);
            // dx = this.map[i + 1] * P_SPACE;
            dx = this.get_x(this.map[i + 1]);
            p.line(sx, this.shift_y(0), dx, this.shift_y(V_SPACE));
        }

        if (this.drawing) {
            // p.line((this.origin + 1) * P_SPACE, 0, this.lx, this.ly);
            p.line(this.get_x(this.origin + 1), this.shift_y(0), this.lx, this.ly);
            this.tick()
        }

        for (var i = 0; i < dim; i++) {
            // p.ellipse((i + 1) * P_SPACE, 0, 10);
            // p.ellipse((i + 1) * P_SPACE,    V_SPACE, 10);
            var x = this.get_x(i + 1);
            p.fill(0);
            p.textSize(24);
            p.textAlign(p.CENTER)
            if (this.magic != 2) {
                p.text("" + (i + 1), x, this.shift_y(-15));
            }

            if (this.magic != 1) {
                p.text("" + (i + 1), x, this.shift_y(V_SPACE + 30));
            }

            if (!this.isDone()) {
                p.fill(255);
            }
            p.ellipse(x, this.shift_y(0), 10);
            p.ellipse(x, this.shift_y(V_SPACE), 10);
        }

        //
        if (Object.keys(this.map).length == dim) {
            var cycles = follow_cycles(this.map, this.dim);
            var sign = 1;
            var temp = cycles.map(function(e) {
                sign *= Math.pow(-1, e.length - 1);
                return "(" + e.join("") + ")";
            })

            p.textSize(32);
            p.fill(0);
            p.textAlign(p.CENTER);

            if (this.magic == 0) {
                p.text(temp.join(""), this.get_x(Math.floor(dim / 2) + 1),  this.shift_y(V_SPACE + 70));
                p.text("Sign: " + sign, this.get_x(Math.floor(dim / 2) + 1),  this.shift_y(V_SPACE + 100));
            } else if (this.magic == 2) {
                console.log("Trying hard");
                // p.text(temp.join(""), this.get_x(Math.floor(dim / 2) + 1),  this.shift_y(V_SPACE + 100));
                p.text("Sign: " + this.sign_override, this.get_x(Math.floor(dim / 2) + 1),  this.shift_y(V_SPACE + 70));
            }
            // console.log(sign);
        }


    }

    this.tick = function() {
        if (this.drawing) {
            this.lx = p.mouseX;
            this.ly = p.mouseY;
        }
    }

    this.get_sign = function() {
        var cycles = follow_cycles(this.map, this.dim);
        var sign = 1;
        var temp = cycles.map(function(e) {
            sign *= Math.pow(-1, e.length - 1);
            return "(" + e.join("") + ")";
        })
        return sign;
    }

    this.clicked_in = function(x, y) {
        // console.log(x, y);
        for (var i = 0; i < dim; i++) {
            if (p.dist(this.get_x(i + 1), this.shift_y(0), x, y) < 30 && !this.drawing) {
                // p.fill(255, 0, 0);
                // p.ellipse((i + 1) * P_SPACE, 0, 12);
                this.drawing = true;
                this.lx = x;
                this.ly = y;
                this.origin = i;
                return;
            } else if (p.dist(this.get_x(i + 1), this.shift_y(V_SPACE), x, y) < 30 && this.drawing) {
                this.drawing = false;
                this.map[this.origin + 1] = i + 1;
                return;
            }
            //  else {
            // }
        }

        if (this.drawing) {
            this.drawing = false;
        }

    }

    this.isDone = function() {
        return Object.keys(this.map).length == this.dim;
    }
}

var test_canvas = function (p) {

    var render_list = []
    var done = false;

    p.setup = function() {
        p.fill(60);
        p.createCanvas(850, 900);
        p.frameRate(FPS);
        render_list.push(new Permutation({}, DIM, 0, 100, p));
        render_list.push(new Permutation({}, DIM, 400, 100, p));
        render_list.forEach(function(e) {e.render(p);});
    };

    p.draw = function () {
        p.background(240);
        render_list.forEach(function(e) {e.render(p);});
        if (!done) {
            if (render_list[0].isDone() && render_list[1].isDone()) {
                done = true;
                //extract composed map
                p1 = new Permutation(render_list[0].map, DIM, 200, 400, p);
                p1.magic = 1;
                render_list.push(p1);
                p2 = new Permutation(render_list[1].map, DIM, 200, 550, p);
                p2.magic = 2;
                render_list.push(p2);
                p2.sign_override = p1.get_sign() * p2.get_sign();
                console.log("wow");
            }
        }
    };

    p.mouseClicked = function(e) {
        render_list.forEach(function(e) {e.clicked_in(p.mouseX, p.mouseY);});
    };
}

// var sktech = new p5(test_canvas, "test");
var static_canvas = function (p) {
    var render_list = []
    var done = false;

    p.setup = function() {
        p.fill(60);
        p.createCanvas(500, 500);
        p.frameRate(FPS);
        render_list.push(new Permutation({1:2, 2:3, 3:4, 4:1}, 4, 0, 100, p));
        render_list.forEach(function(e) {e.render(p);});
    };

    p.draw = function () {
        p.background(255);
        render_list.forEach(function(e) {e.render(p);});
    };

    p.mouseClicked = function(e) {
        render_list.forEach(function(e) {e.clicked_in(p.mouseX, p.mouseY);});
    };
}


var static_perm = new p5(static_canvas, "static_perm");
var perm = new p5(test_canvas, "perm");

