function Panel() {

    this.logs = [];
}


Panel.WIDTH = 310;

Panel.LOG_START_Y = 36;
Panel.LOG_LINE_HEIGHT = 32;


Panel.prototype.addLog = function(text) {
    this.logs.push({
        text : new Text({
            text : text,
            size : 32,
            font : "Gaegu",
            align : "center",
            color : "#fff",
            borderWidth : 3,
            borderColor : "#000"
        }),
        pos : Panel.LOG_START_Y + (this.logs.length * Panel.LOG_LINE_HEIGHT),
        targetPos : Panel.LOG_START_Y + (this.logs.length * Panel.LOG_LINE_HEIGHT),
        velocity : 0,
        life : 4
    });
};


Panel.prototype.update = function() {

    let log;
    let y = Panel.LOG_START_Y;

    let newLogs = [];
    let a = Panel.LOG_LINE_HEIGHT * 2;

    for(let i = 0; i < this.logs.length; i++) {
        log = this.logs[i];
        log.life -= Timer.delta;
        log.targetPos = y;
        if(log.pos !== log.targetPos) {
            let result = Interpolate.accelerateToPos(log.pos, log.targetPos, log.velocity, a, a);
            log.pos = result.pos;
            log.velocity = result.velocity;
        }
        y += Panel.LOG_LINE_HEIGHT;
        if(log.life > 0) {
            newLogs.push(log);
        }
    }

    this.logs = newLogs;

};


Panel.prototype.draw = function() {

    c.save();
    c.translate((Game.width - Panel.WIDTH) * 0.5, 0);

    for(let i = 0; i < this.logs.length; i++) {
        c.globalAlpha = Utils.limit(this.logs[i].life * 2, 0.0, 1.0);
        this.logs[i].text.drawPos(0, this.logs[i].pos);
        c.globalAlpha = 1;
    }

    c.restore();

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