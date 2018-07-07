function SurpManager() {

    this.surps = {};

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
    for(let surpIndex in this.surps) {
        this.surps[surpIndex].update();
    }
};


SurpManager.prototype.draw = function() {

    // TODO draw order

    let surp;
    for(let surpIndex in this.surps) {
        surp = this.surps[surpIndex];
        surp.drawShadow();
    }

    for(let surpIndex in this.surps) {
        surp = this.surps[surpIndex];
        surp.draw();
    }


    for(let surpIndex in this.surps) {
        surp = this.surps[surpIndex];
        surp.drawName();
    }

};