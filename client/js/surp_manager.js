function SurpManager() {

    this.surps = {};

    this.holeDrawOrder = [];
    this.drawOrder = [];

    this.initialConnectTime = 2.0;

}


SurpManager.prototype.addSurp = function(data) {
    this.surps[data.id] = new Surp(data);
    if(this.initialConnectTime === 0.0 && data.id !== WebsocketManager.id) {
        panel.addLog("Sir " + this.surps[data.id].name + " Prise joined the game.");
        Sound.play("spawn");
    }
};


SurpManager.prototype.isSurp = function(id) {
    return this.surps.hasOwnProperty(id);
};


SurpManager.prototype.updateSurp = function(id, data) {
    this.surps[id].updateData(data);
};


SurpManager.prototype.deleteSurp = function(id) {
    this.surps[id].disconnected = true;
    if(this.initialConnectTime === 0.0 && data.id !== WebsocketManager.id) {
        panel.addLog("Sir " + this.surps[id].name + " Prise disconnected.");
    }
};


SurpManager.prototype.update = function() {
    let surp;
    let x;
    let y;

    let view = camera.getRenderLimitsInGameCoords();

    this.holeDrawOrder = [];
    this.drawOrder = [];

    for(let surpIndex in this.surps) {
        surp = this.surps[surpIndex];
        if(surp.deathAni > 1.0) {
            delete this.surps[surpIndex];

        } else {
            surp.update();
            x = surp.drawPos.x;
            y = surp.drawPos.y;
            if(x > view.startX && x < view.endX && y > view.startY && y < view.endY) {
                if(surp.fallInHoleCooldown > 0.0 && ((y < 0 && y > -18) || y > 20)) {
                    this.holeDrawOrder.push(surp);
                } else {
                    this.drawOrder.push(surp);
                }
            }
        }
    }

    boxManager.addBoxesToDrawOrder(this.drawOrder, view);
    field.addBallToDrawOrder(this.drawOrder, view);

    this.holeDrawOrder.sort(this.comparator);
    this.drawOrder.sort(this.comparator);

    if(this.initialConnectTime > 0.0) {
        this.initialConnectTime -= Timer.delta;
        if(this.initialConnectTime <= 0.0) {
            this.initialConnectTime = 0.0;
        }
    }
};


SurpManager.prototype.comparator = function(a, b) {
    if(a.drawPos.y < b.drawPos.y) {
        return -1;
    }
    if(a.drawPos.y > b.drawPos.y) {
        return 1;
    }
    return 0;
};


SurpManager.prototype.drawInHole = function() {

    for(let i in this.holeDrawOrder) {
        this.holeDrawOrder[i].drawShadow();
    }
    for(let i in this.holeDrawOrder) {
        this.holeDrawOrder[i].draw();
    }
    for(let i in this.holeDrawOrder) {
        this.holeDrawOrder[i].drawName();
    }

};


SurpManager.prototype.draw = function() {

    for(let i in this.drawOrder) {
        this.drawOrder[i].drawShadow();
    }
    for(let i in this.drawOrder) {
        this.drawOrder[i].draw();
    }
    for(let i in this.drawOrder) {
        this.drawOrder[i].drawName();
    }

};