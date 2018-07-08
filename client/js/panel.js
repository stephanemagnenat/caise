function Panel() {

}


Panel.WIDTH = 310;


Panel.prototype.update = function() {

};


Panel.prototype.draw = function() {

    c.save();
    c.translate(Game.width - Panel.WIDTH, 0);

    c.fillStyle = "#fff";

    Utils.drawRoundedCornerRect(0, 10, 300, 500, 10);
    c.fill();

    Utils.drawRoundedCornerRect(0, 520, 300, 300, 10);
    c.fill();

    Utils.drawRoundedCornerRect(0, 830, 300, 240, 10);
    c.fill();

    c.restore();

};