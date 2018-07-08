function Field() {

    Surp.initAnimations();

    this.grass = new Grass();
}


Field.prototype.update = function() {

    Surp.updateAnimations();
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