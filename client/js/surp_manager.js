function SurpManager() {

    this.surps = {};

    this.holeDrawOrder = [];
    this.drawOrder = [];

}


SurpManager.prototype.addSurp = function(data) {
    this.surps[data.id] = new Surp(data);
};


SurpManager.prototype.isSurp = function(id) {
    return this.surps.hasOwnProperty(id);
};


SurpManager.prototype.updateSurp = function(id, data) {
    this.surps[id].updateData(data);
};


SurpManager.prototype.update = function() {
    let surp;
    let y;

    this.holeDrawOrder = [];
    this.drawOrder = [];

    for(let surpIndex in this.surps) {
        surp = this.surps[surpIndex];
        surp.update();
        y = surp.drawPos.y;
        if(surp.fallInHoleCooldown > 0.0 && ((y < 0 && y > -18) || y > 20)) {
            this.holeDrawOrder.push(surp);
        } else {
            this.drawOrder.push(surp);
        }
    }

    this.holeDrawOrder.sort(this.comparator);
    this.drawOrder.sort(this.comparator);
};


SurpManager.prototype.comparator = function(a, b) {
    if(a.pos.y < b.pos.y) {
        return -1;
    }
    if(a.pos.y > b.pos.y) {
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