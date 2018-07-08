function Camera() {

    this.pos = new Vec2(0, 0);

    this.zoom = 24.0;

    this.history = [];
}


Camera.HISTORY_LENGTH = 0.8;


Camera.prototype.update = function() {

    this.history.push({ pos : this.getIdealPos(), delta : Timer.delta });

    let totalLengthHistory = 0;
    let totalPos = new Vec2(0, 0);

    let newHistory = [];
    for(let i = this.history.length - 1; i >= 0 && totalLengthHistory <= Camera.HISTORY_LENGTH; i--) {
        let point = this.history[i];
        totalPos = totalPos.add(point.pos.multiply(point.delta));
        totalLengthHistory += point.delta;
    }

    this.pos = totalPos.multiply(1 / totalLengthHistory);


};


Camera.prototype.getIdealPos = function() {
    if(websocketManager.id === null || !surpManager.surps.hasOwnProperty(websocketManager.id)) {
        return new Vec2(0, 0);
    } else {
        let mySurp = surpManager.surps[websocketManager.id];
        return mySurp.drawPos.add(mySurp.lastSpeed.multiply(0.2 * mySurp.walkingAmplitude));
    }
};


Camera.prototype.apply = function() {
    c.save();
    c.translate(0.5 * (Game.width - Panel.WIDTH), Game.centerY);
    c.scale(this.zoom, this.zoom);
    c.translate(-this.pos.x, -this.pos.y);
};


Camera.prototype.restore = function() {
    c.restore();
};


Camera.prototype.getRenderLimitsInRetinaGraphicCoords = function() {
    let offsetX = 48 * 70;
    let offsetY = 48 * 50;
    let x = this.pos.x * this.zoom;
    let y = this.pos.y * this.zoom;
    let centerX = 0.5 * (Game.width - Panel.WIDTH);
    return {
        startX : offsetX + (2 * (x - centerX)),
        endX : offsetX + (2 * (x + (Game.width - centerX))),
        startY : offsetY + (2 * (y - (0.5 * Game.height))),
        endY : offsetY + (2 * (y + (0.5 * Game.height)))
    };
};

