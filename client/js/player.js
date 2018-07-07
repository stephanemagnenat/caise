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


