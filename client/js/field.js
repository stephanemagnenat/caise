function Field() {

    Surp.initAnimations();

    this.grass = new Grass();

    this.ballId = -1;
    this.ball = null;
    this.ballLagFixes = [];

    this.ballAni = 0;
    this.ballAniHeight = 0;
}


Field.prototype.addBall = function(data) {
    this.ballId = data.id;
    this.ball = {
        id : data.id,
        pos : new Vec2(data.pos[0], data.pos[1]),
        drawPos : new Vec2(data.pos[0], data.pos[1]),
        speed : new Vec2(data.speed[0], data.speed[1]),
        speedHl : data.speed_hl,
        drawShadow : function() {
            field.drawBallShadow();
        },
        draw : function() {
            field.drawBall();
        },
        drawName : function() {}
    };
};


Field.prototype.isBall = function(id) {
    return id === this.ballId;
};


Field.prototype.updateBall = function(data) {
    if(this.ball !== null) {

        let newPos = new Vec2(data.pos[0], data.pos[1]);
        this.ballLagFixes.push({ delta : this.ball.pos.subtract(newPos), effect : 1.0 });
        this.ball.pos = newPos;
        this.ball.drawPos = new Vec2(data.pos[0], data.pos[1]);
        this.ball.speed = new Vec2(data.speed[0], data.speed[1]);
        this.ball.speedHl = data.speed_hl;
    }
};


Field.prototype.deleteBall = function() {
    this.ballId = -1;
    this.ball = null;
    this.ballLagFixes = [];
};


Field.prototype.addBallToDrawOrder = function(drawOrder, view) {
    if(this.ball !== null) {
        let x = this.ball.drawPos.x;
        let y = this.ball.drawPos.y;
        if(x > view.startX && x < view.endX && y > view.startY && y < view.endY) {
            drawOrder.push(this.ball);
        }
    }
};


Field.prototype.drawBallShadow = function() {
    c.save();
    c.translate(this.ball.drawPos.x, this.ball.drawPos.y);

    c.scale(1.0 - (0.15 * this.ballAniHeight), 0.8 - (0.12 * this.ballAniHeight));
    let gradient = c.createRadialGradient(0, 0, 0, 0, 0, 1.0);
    gradient.addColorStop(0.75 - (0.2 * this.ballAniHeight), "rgba(0, 0, 0, 0.2)");
    gradient.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    c.fillStyle = gradient;
    Utils.drawCircle(c, 0, 0, 1.0);
    c.fill();

    c.restore();
};


Field.prototype.drawBall = function() {

    c.save();
    c.translate(this.ball.drawPos.x, this.ball.drawPos.y);

    Img.drawScaled("star", -1.5, -2.4 - (0.6 * this.ballAniHeight), 0.0208333);

    c.restore();

};


Field.prototype.update = function() {

    Surp.updateAnimations();

    if(this.ball !== null) {

        this.ballAni += Timer.delta;
        if(this.ballAni > 1.0) {
            this.ballAni -= 1.0;
        }
        this.ballAniHeight = 0.5 - (0.5 * Math.cos(TWO_PI * this.ballAni));

        this.ball.pos = this.ball.pos.add(this.ball.speed.multiply(Timer.delta));
        if(this.ball.speedHl > 0) {
            this.ball.speed = this.ball.speed.multiply(Math.pow(2, -Timer.delta / this.ball.speedHl));
        }

        this.ball.drawPos = this.ball.pos;
        let newLagFixes = [];
        let lagFix;
        for(let i = 0; i < this.ballLagFixes.length; i++) {
            lagFix = this.ballLagFixes[i];
            lagFix.effect -= Timer.delta * 3.0;
            if(lagFix.effect > 0) {
                this.ball.drawPos = this.ball.drawPos.add(lagFix.delta.multiply(lagFix.effect));
                newLagFixes.push(lagFix);
            }
        }
        this.ballLagFixes = newLagFixes;
    }
};


Field.prototype.draw = function() {

    let outerArcAngle = 0.7753975;
    let innerArcAngle = 0.442911;

    c.fillStyle = "#61CF8F";
    c.fillRect(0, 0, Game.width, Game.height);

    camera.apply();


    // holes

    c.fillStyle = "#000";
    c.beginPath();
    c.moveTo(-15, -15);
    c.arc(0, 0, 35, -PI + innerArcAngle, -HALF_PI - innerArcAngle);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(15, -15);
    c.arc(0, 0, 35, -HALF_PI + innerArcAngle, -innerArcAngle);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(15, 15);
    c.arc(0, 0, 35, innerArcAngle, HALF_PI - innerArcAngle);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(-15, 15);
    c.arc(0, 0, 35, HALF_PI + innerArcAngle, PI - innerArcAngle);
    c.closePath();
    c.fill();


    surpManager.drawInHole();


    // all lines

    c.lineWidth = 0.75;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = "#ceffba";


    // outer line

    c.fillStyle = "#61CF8F";
    c.beginPath();
    c.moveTo(-70, -50);
    c.lineTo(-50, -50);
    c.lineTo(-50, -35);
    c.arc(0, 0, 50, -PI + outerArcAngle, -outerArcAngle);
    c.lineTo(50, -35);
    c.lineTo(50, -50);
    c.lineTo(70, -50);
    c.lineTo(70, 50);
    c.lineTo(50, 50);
    c.lineTo(50, 35);
    c.arc(0, 0, 50, outerArcAngle, PI -outerArcAngle);
    c.lineTo(-50, 35);
    c.lineTo(-50, 50);
    c.lineTo(-70, 50);
    c.closePath();

    c.moveTo(-15, -15);
    c.arc(0, 0, 35, -HALF_PI - innerArcAngle, -PI + innerArcAngle, true);
    c.closePath();

    c.moveTo(15, -15);
    c.arc(0, 0, 35, -innerArcAngle, -HALF_PI + innerArcAngle, true);
    c.closePath();

    c.moveTo(15, 15);
    c.arc(0, 0, 35, HALF_PI - innerArcAngle, innerArcAngle, true);
    c.closePath();

    c.moveTo(-15, 15);
    c.arc(0, 0, 35, PI - innerArcAngle, HALF_PI + innerArcAngle, true);
    c.closePath();

    c.fill();
    c.stroke();


    // mid dot

    c.fillStyle = "#ceffba";
    Utils.drawCircle(c, 0, 0, 0.75);
    c.fill();


    // circle lines

    let dash = 1.02;
    c.setLineDash([dash, 2 * dash]);

    c.beginPath();
    c.arc(0, 0, 50, -PI - outerArcAngle, -PI + outerArcAngle);
    c.stroke();

    c.beginPath();
    c.arc(0, 0, 50, -outerArcAngle, outerArcAngle);
    c.stroke();

    dash = 0.995;
    c.setLineDash([dash, 2 * dash]);

    c.beginPath();
    c.arc(0, 0, 35, -HALF_PI - innerArcAngle, -HALF_PI + innerArcAngle);
    c.stroke();

    c.beginPath();
    c.arc(0, 0, 35, -innerArcAngle, innerArcAngle);
    c.stroke();

    c.beginPath();
    c.arc(0, 0, 35, HALF_PI - innerArcAngle, HALF_PI + innerArcAngle);
    c.stroke();

    c.beginPath();
    c.arc(0, 0, 35, PI - innerArcAngle, PI + innerArcAngle);
    c.stroke();


    // inner straight lines

    dash = 0.965;
    c.setLineDash([dash, 2 * dash]);

    c.beginPath();
    c.moveTo(-15, -15);
    c.lineTo(15, -15);
    c.stroke();

    c.beginPath();
    c.moveTo(15, -15);
    c.lineTo(15, 15);
    c.stroke();

    c.beginPath();
    c.moveTo(15, 15);
    c.lineTo(-15, 15);
    c.stroke();

    c.beginPath();
    c.moveTo(-15, 15);
    c.lineTo(-15, -15);
    c.stroke();


    // side straight lines

    dash = 0.95;
    c.setLineDash([dash, 2 * dash]);

    c.beginPath();
    c.moveTo(-70, -15);
    c.lineTo(-55, -15);
    c.stroke();

    c.beginPath();
    c.moveTo(-70, 15);
    c.lineTo(-55, 15);
    c.stroke();

    c.beginPath();
    c.moveTo(70, -15);
    c.lineTo(55, -15);
    c.stroke();

    c.beginPath();
    c.moveTo(70, 15);
    c.lineTo(55, 15);
    c.stroke();

    dash = 0.962;
    c.setLineDash([dash, 2 * dash]);

    c.beginPath();
    c.moveTo(-55, 15);
    c.lineTo(-55, -15);
    c.stroke();

    c.beginPath();
    c.moveTo(55, 15);
    c.lineTo(55, -15);
    c.stroke();


    // corner straight lines

    dash = 0.915;
    c.setLineDash([dash, 2 * dash]);

    c.beginPath();
    c.moveTo(-70, -35);
    c.lineTo(-50, -35);
    c.stroke();

    c.beginPath();
    c.moveTo(70, -35);
    c.lineTo(50, -35);
    c.stroke();

    c.beginPath();
    c.moveTo(70, 35);
    c.lineTo(50, 35);
    c.stroke();

    c.beginPath();
    c.moveTo(-70, 35);
    c.lineTo(-50, 35);
    c.stroke();

    c.setLineDash([]);

    this.drawColorCircleSlices();

    this.grass.draw();

    surpManager.draw();

    bulletManager.draw();

    camera.restore();

};


Field.prototype.drawColorCircleSlices = function() {

    let colors = [
        "#ff0000",
        "#ffba00",
        "#ffff00",
        "#80ff00",
        "#00ff37",
        "#00ff94",
        "#00ffff",
        "#0084ff",
        "#1800ff",
        "#8400ff",
        "#ff00ff",
        "#ff00be"
    ];

    let radius = 1.2;
    let margin = 0.3;
    let sideAngle = TWO_PI / 24;
    
    let outerRadius = 49.675 - (2 * margin);
    let innerRadius = 35.375 + (2 * margin);
    let outerMidRadius = outerRadius - radius;
    let innerMidRadius = innerRadius + radius;

    let outerAngle = sideAngle - ((radius + margin) / outerMidRadius);
    let innerAngle = sideAngle - ((radius + margin) / innerMidRadius);

    let outerSin = Math.sin(outerAngle);
    let outerCos = Math.cos(outerAngle);
    let innerSin = Math.sin(innerAngle);
    let innerCos = Math.cos(innerAngle);

    for(let i = 0; i < 12; i++) {
        c.save();
        c.rotate(i * 2 * sideAngle);

        c.fillStyle = colors[i];
        c.beginPath();
        c.arc(outerCos * outerMidRadius, -outerSin * outerMidRadius, radius, -HALF_PI - sideAngle, -sideAngle);
        c.arc(0, 0, outerRadius, -outerAngle, outerAngle);
        c.arc(outerCos * outerMidRadius, outerSin * outerMidRadius, radius, sideAngle, HALF_PI + sideAngle);
        c.arc(innerCos * innerMidRadius, innerSin * innerMidRadius, radius, HALF_PI + sideAngle, PI + sideAngle);
        c.arc(0, 0, innerRadius, innerAngle, -innerAngle, true);
        c.arc(innerCos * innerMidRadius, -innerSin * innerMidRadius, radius, PI - sideAngle, -HALF_PI - sideAngle);
        c.closePath();
        c.fill();

        c.restore();
    }

};