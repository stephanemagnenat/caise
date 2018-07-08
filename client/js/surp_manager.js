function SurpManager() {

    this.surps = {};

    this.holeDrawOrder = [];
    this.drawOrder = [];

}


SurpManager.prototype.addSurp = function(data) {
    this.surps[data.id] = new Surp(data);
    // TODO joined message
};


SurpManager.prototype.isSurp = function(id) {
    return this.surps.hasOwnProperty(id);
};


SurpManager.prototype.updateSurp = function(id, data) {
    this.surps[id].updateData(data);
};


SurpManager.prototype.deleteSurp = function(id) {
    this.surps[id].disconnected = true;
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