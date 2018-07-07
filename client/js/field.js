function Field() {

    Surp.initAnimations();

    this.test = new Surp();
}


Field.prototype.update = function() {

    Surp.updateAnimations();

    this.test.update();
};


Field.prototype.draw = function() {

    let outerArcAngle = 0.7753975;
    let innerArcAngle = 0.442911;

    c.fillStyle = "#61CF8F";
    c.fillRect(0, 0, Game.width, Game.height);

    camera.apply();

    c.lineWidth = 0.75;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = "#fff";


    // mid dot

    c.fillStyle = "#fff";
    Utils.drawCircle(c, 0, 0, 0.75);
    c.fill();


    // outer line

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
    c.stroke();


    // holes

    c.beginPath();
    c.moveTo(-15, -15);
    c.arc(0, 0, 35, -PI + innerArcAngle, -HALF_PI - innerArcAngle);
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(15, -15);
    c.arc(0, 0, 35, -HALF_PI + innerArcAngle, -innerArcAngle);
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(15, 15);
    c.arc(0, 0, 35, innerArcAngle, HALF_PI - innerArcAngle);
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(-15, 15);
    c.arc(0, 0, 35, HALF_PI + innerArcAngle, PI - innerArcAngle);
    c.closePath();
    c.stroke();

    c.strokeStyle = "rgba(255, 255, 255, 0.8)";


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


    this.test.drawShadow();

    this.test.draw();


    camera.restore();

};