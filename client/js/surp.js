function Surp() {

    this.pos = new Vec2(3, 4);
    this.pointsSin = [];
    this.pointsMag = [];

    this.spikiness = 0.0;
    this.color = 0.0;
    this.colorObj = Color.fromHSL(this.color, 1.0, 0.5);
    this.halfColorObj = Color.fromHSL(this.color, 0.5, 0.8);

    for(let i = 0; i < Surp.NUM_OF_POINTS; i++) {
        this.pointsSin[i] = Utils.rand(0, Surp.NUM_OF_SINS - 1);
        if(i % 2 === 0) {
            this.pointsMag[i] = Utils.randFloat(0.3, 0.7);
        } else {
            this.pointsMag[i] = Utils.randFloat(-0.4, -0.2);
        }

    }

    this.jumpAnimation = 0.0;
    this.jumpHeight = 0.0;
    this.jumpSquish = 0.0;

}

Surp.NUM_OF_POINTS = 20;
Surp.NUM_OF_SINS = 50;


Surp.sins = [];
Surp.sinValues = [];
Surp.sinSpeeds = [];

Surp.circleSin = [];
Surp.circleCos = [];


Surp.initAnimations = function() {

    for(let i = 0; i < Surp.NUM_OF_SINS; i++) {
        Surp.sins[i] = 0;
        Surp.sinValues[i] = Utils.randFloat(0, TWO_PI);
        Surp.sinSpeeds[i] = Utils.randFloat(0.7, 1.5) * TWO_PI;
    }

    for(let i = 0; i < Surp.NUM_OF_POINTS; i++) {
        let angle = TWO_PI * (i / Surp.NUM_OF_POINTS);
        Surp.circleSin[i] = Math.sin(angle);
        Surp.circleCos[i] = Math.cos(angle);
    }
};


Surp.updateAnimations = function() {
    for(let i = 0; i < Surp.NUM_OF_SINS; i++) {
        Surp.sinValues[i] += Timer.delta * Surp.sinSpeeds[i];
        if(Surp.sinValues[i] > TWO_PI) {
            Surp.sinValues[i] -= TWO_PI;
        }
        Surp.sins[i] = 0.5 + (0.5 * Math.sin(Surp.sinValues[i]));
    }
};


Surp.prototype.update = function() {
    this.spikiness = Utils.limit(Mouse.pos.y / Game.height, 0.0, 1.0);

    this.color = Utils.limit(Mouse.pos.x / Game.width, 0.0, 1.0);
    this.colorObj = Color.fromHSL(this.color, 1.0, 0.5);
    this.halfColorObj = Color.fromHSL(this.color, 0.5, 0.7);

    if(Mouse.left.down) {
        this.jumpAnimation += Timer.delta * 1.6;
        if(this.jumpAnimation > 1.0) {
            this.jumpAnimation -= 1.0;
        }
    }
    this.jumpSquish = Math.cos((this.jumpAnimation + 0.3) * TWO_PI);
    this.jumpHeight = 0.5 - (0.5 * Math.cos(this.jumpAnimation * TWO_PI));
};


Surp.prototype.drawShadow = function() {
    c.save();
    c.translate(this.pos.x, this.pos.y);

    c.scale(1.0 - (0.25 * this.jumpHeight), 0.8 - (0.2 * this.jumpHeight));
    let gradient = c.createRadialGradient(0, 0, 0, 0, 0, 1.2);
    gradient.addColorStop(0.75 - (0.5 * this.jumpHeight), "rgba(0, 0, 0, 0.3)");
    gradient.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    c.fillStyle = gradient;
    Utils.drawCircle(c, 0, 0, 1.2);
    c.fill();

    c.restore();
};


Surp.prototype.draw = function() {

    c.save();
    c.translate(this.pos.x, this.pos.y);
    c.translate(0, 0.6 - (1.2 * this.jumpHeight));
    c.scale(1.0 + (this.jumpSquish * 0.1), 1.0 - (this.jumpSquish * 0.1));
    c.translate(0, -1.5);

    /*c.strokeStyle = "#000";
    c.lineWidth = 0.1333;
    c.fillStyle = "#fcc";
    Utils.drawCircle(c, 0, 0, 0.9);
    c.fill();
    c.stroke();*/

    // body

    let gradient = c.createRadialGradient(0, 0, 0, 0, 0, 1.5 + (0.5 * this.spikiness));
    let gradColor = "rgba(" + this.halfColorObj.r + "," + this.halfColorObj.g + "," + this.halfColorObj.b + ", ";
    gradient.addColorStop(0, gradColor + "0.0)");
    gradient.addColorStop(0.7, gradColor + "1.0)");
    c.fillStyle = gradient;
    c.strokeStyle = this.colorObj.toHex();
    c.lineWidth = 0.2;
    if(this.spikiness > 0.4) {
        c.lineJoin = "miter";
    } else {
        c.lineJoin = "round";
    }

    c.beginPath();
    let sinMultiplier = 0.05 + (0.15 * this.spikiness);
    let radius;
    for(let i = 0; i < Surp.NUM_OF_POINTS; i++) {
        radius = 1.5 + (sinMultiplier * Surp.sins[this.pointsSin[i]]) + (this.pointsMag[i] * this.spikiness);
        if(i === 0) {
            c.moveTo(Surp.circleCos[i] * radius, Surp.circleSin[i] * radius);
        } else {
            c.lineTo(Surp.circleCos[i] * radius, Surp.circleSin[i] * radius);
        }
    }
    c.closePath();
    c.fill();
    c.stroke();


    // cheeks

    let lookDir = 0.5 * (-1.0 + (2.0 * Utils.limit(Mouse.pos.x / Game.width, 0.0, 1.0)));

    c.fillStyle = this.colorObj.toHex();
    c.save();
    c.translate(-0.675 + lookDir, 0.75);
    c.scale(1.5, 0.9);
    Utils.drawCircle(c, 0, 0, 0.2);
    c.fill();
    c.restore();
    c.save();
    c.translate(0.675 + lookDir, 0.75);
    c.scale(1.5, 0.9);
    Utils.drawCircle(c, 0, 0, 0.18);
    c.fill();
    c.restore();


    // face

    Img.drawSpriteScaled("face", -1.5 + lookDir, -1.5, 3, 3, 0, 0, 0.0208333);


    // reflection

    c.strokeStyle = "#fff";
    c.lineWidth = 0.25;
    c.beginPath();
    c.arc(0, 0, 1.03, -1.2, -0.5);
    c.stroke();

    c.restore();

};