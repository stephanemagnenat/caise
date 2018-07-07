function Camera() {

    this.pos = new Vec2(0, 0);
}


Camera.prototype.update = function() {

    let arrows = Utils.getArrowControls();
    this.pos = this.pos.add(arrows.multiply(10 * Timer.delta));
};


Camera.prototype.apply = function() {
    c.save();
    c.translate(Game.centerX, Game.centerY);
    c.scale(24, 24);
    c.translate(-this.pos.x, -this.pos.y);
};


Camera.prototype.restore = function() {
    c.restore();
};

