function BoxManager() {

    this.boxes = {};


}


BoxManager.prototype.addBox = function(data) {

    this.boxes[data.id] = {
        id : data.id,
        drawPos : new Vec2(data.pos[0], data.pos[1]),
        drawShadow : function() {
            boxManager.drawShadow(this.id);
        },
        draw : function() {
            boxManager.draw(this.id);
        },
        drawName : function() {
            boxManager.drawName(this.id);
        }
    };
};


BoxManager.prototype.isBox = function(id) {
    return this.boxes.hasOwnProperty(id);
};


BoxManager.prototype.updateBox = function(id, data) {
    // TODO
};


BoxManager.prototype.deleteBox = function(id) {
    // TODO
};


BoxManager.prototype.addBoxesToDrawOrder = function(drawOrder, view) {
    let box;
    let x;
    let y;

    for(let boxIndex in this.boxes) {
        box = this.boxes[boxIndex];
        x = box.drawPos.x;
        y = box.drawPos.y;
        if(x > view.startX && x < view.endX && y > view.startY && y < view.endY) {
            drawOrder.push(box);
        }
    }
};


BoxManager.prototype.drawShadow = function(id) {

    let box = this.boxes[id];

};


BoxManager.prototype.draw = function(id) {

    let box = this.boxes[id];
    c.save();
    c.translate(box.drawPos.x, box.drawPos.y);

    c.fillStyle = "#c00";
    c.fillRect(-0.5, -1, 1, 1);

    c.restore();
};


BoxManager.prototype.drawName = function(id) {

    let box = this.boxes[id];

};