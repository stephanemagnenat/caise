function Player() {

    this.buttonControls = new Vec2(0, 0);
}


Player.prototype.updateControls = function() {

    let newControls = Utils.getArrowControls();
    if(newControls.x !== this.buttonControls.x || newControls.y !== this.buttonControls.y) {
        this.buttonControls = newControls;
        let roundedX = Math.round(100 * this.buttonControls.x);
        let roundedY = Math.round(100 * this.buttonControls.y);
        websocketManager.send({ action: "move", speed: [roundedX, roundedY] });
    }
};


Player.prototype.draw = function() {

    if(websocketManager.id === null || !surpManager.surps.hasOwnProperty(websocketManager.id)) {
        c.fillStyle = "#000";
        c.fillRect(0, 0, Game.width, Game.height);
        return;
    }
    let mySurp = surpManager.surps[websocketManager.id];
    if(mySurp.fallInHoleCooldown > 0.0) {
        c.globalAlpha = 1.0 - mySurp.fallInHoleCooldown;
        c.fillStyle = "#000";
        c.fillRect(0, 0, Game.width, Game.height);
        c.globalAlpha = 1.0;
    }
};


