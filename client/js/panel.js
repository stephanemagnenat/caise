function Panel() {

    this.logs = [];

    this.title = new Text({
        size : 42,
        font : "Fredoka One",
        align : "left",
        color : "#ff5988"
    });
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


    // log

    c.save();
    c.translate((Game.width - Panel.WIDTH) * 0.5, 0);

    for(let i = 0; i < this.logs.length; i++) {
        c.globalAlpha = Utils.limit(this.logs[i].life * 2, 0.0, 1.0);
        this.logs[i].text.drawPos(0, this.logs[i].pos);
        c.globalAlpha = 1;
    }

    c.restore();


    // scores

    c.save();
    c.translate(Game.width - Panel.WIDTH, 0);

    c.fillStyle = "#fff5f7";
    Utils.drawRoundedCornerRect(0, 10, 300, 500, 25);
    c.fill();

    c.fillStyle = "#ffd6e1";
    Utils.drawRoundedCornerRect(0, 10, 300, 100, 25);
    c.fill();

    this.title.drawPosText(20, 90, "Leaderboard");

    c.lineWidth = 8;
    c.strokeStyle = "#ff5988";
    Utils.drawRoundedCornerRect(0, 10, 300, 500, 25);
    c.stroke();

    c.restore();


    // rules

    c.save();
    c.translate(Game.width - Panel.WIDTH, 515);

    c.fillStyle = "#fff5f7";
    Utils.drawRoundedCornerRect(0, 10, 300, 310, 25);
    c.fill();

    c.fillStyle = "#ffd6e1";
    Utils.drawRoundedCornerRect(0, 10, 300, 74, 25);
    c.fill();

    this.title.drawPosText(20, 64, "Rules");

    c.lineWidth = 8;
    c.strokeStyle = "#ff5988";
    Utils.drawRoundedCornerRect(0, 10, 300, 310, 25);
    c.stroke();

    c.restore();



    // weapon

    c.save();
    c.translate(Game.width - Panel.WIDTH, 840);

    c.fillStyle = "#fff5f7";
    Utils.drawRoundedCornerRect(0, 10, 300, 220, 25);
    c.fill();

    c.fillStyle = "#ffd6e1";
    Utils.drawRoundedCornerRect(0, 10, 300, 74, 25);
    c.fill();

    this.title.drawPosText(20, 64, "Weapon");

    if(websocketManager.id !== null && surpManager.surps.hasOwnProperty(websocketManager.id) && surpManager.surps[websocketManager.id].weapon !== -1) {
        let sprites = [4, 0, 1, 2, 3, 5, 6];
        Img.drawSpriteScaled("bullet", 150 - 36, 110, 72, 72, sprites[surpManager.surps[websocketManager.id].weapon], 0, 0.5);
    }

    c.lineWidth = 8;
    c.strokeStyle = "#ff5988";
    Utils.drawRoundedCornerRect(0, 10, 300, 220, 25);
    c.stroke();

    c.restore();

};