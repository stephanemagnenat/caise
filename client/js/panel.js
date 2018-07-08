function Panel() {

    this.logs = [];

    this.title = new Text({
        size : 42,
        font : "Fredoka One",
        align : "left",
        color : "#ff5988"
    });

    this.highscoreNumber = new Text({
        size : 20,
        font : "Fredoka One",
        align : "center",
        color : "#fff"
    });

    this.playerName = new Text({
        size : 18,
        font : "Gaegu",
        align : "left",
        color : "#ff5988"
    });

    this.scoreValue = new Text({
        size : 18,
        font : "Gaegu",
        align : "right",
        color : "#ff5988"
    });

    this.weaponTitle = new Text({
        size : 20,
        font : "Fredoka One",
        align : "center",
        color : "#ff5988"
    });

    this.explanation = new Text({
        size : 18,
        font : "Gaegu",
        align : "left",
        color : "#ff5988",
        maxWidth : 266,
        lineHeight: 19
    });

    this.centeredExplanation = new Text({
        size : 18,
        font : "Gaegu",
        align : "center",
        color : "#ff5988",
        maxWidth : 260,
        lineHeight: 20
    });

    this.sideExplanation = new Text({
        size : 18,
        font : "Gaegu",
        align : "left",
        color : "#ff5988",
        maxWidth : 140,
        lineHeight: 20
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
    c.translate(Game.width - Panel.WIDTH, 10);

    c.fillStyle = "#fff5f7";
    Utils.drawRoundedCornerRect(0, 0, 300, 508, 25);
    c.fill();

    c.fillStyle = "#ffd6e1";
    Utils.drawRoundedCornerRect(0, 0, 300, 100, 25);
    c.fill();

    this.title.drawPosText(20, 90, "Leaderboard");

    Img.drawScaled("leaderboardFace", 20, 15, 0.65);

    let highscores = surpManager.getHighscores();
    let hadMe = false;

    for(let i = 0; i < highscores.length && i < 10; i++) {
        this.drawHighscore(highscores[i], i + 1, 104 + (i * 36));
        if(highscores[i].id === websocketManager.id) {
            hadMe = true;
        }
    }
    if(hadMe && highscores.length >= 11) {
        this.drawHighscore(highscores[10], 11, 104 + (10 * 36));
    } else {
        for(let i = 10; i < highscores.length; i++) {
            if(highscores[i].id === websocketManager.id) {
                this.drawHighscore(highscores[i], i + 1, 104 + (10 * 36));
            }
        }
    }

    c.lineWidth = 8;
    c.strokeStyle = "#ff5988";
    Utils.drawRoundedCornerRect(0, 0, 300, 508, 25);
    c.stroke();

    c.restore();


    // rules

    c.save();
    c.translate(Game.width - Panel.WIDTH, 523);

    c.fillStyle = "#fff5f7";
    Utils.drawRoundedCornerRect(0, 10, 300, 310, 25);
    c.fill();

    c.fillStyle = "#ffd6e1";
    Utils.drawRoundedCornerRect(0, 10, 300, 74, 25);
    c.fill();

    this.title.drawPosText(20, 64, "Rules");

    Img.drawScaled("ruleFace", 142, 34, 0.62);

    this.explanation.drawPosText(17, 108, "The location of the star determines if you gain or lose points. You and other player can pick up and move the star. Ramming the player with the star will make them lose it.");
    this.explanation.drawPosText(17, 226, "You gain points if the star is...\n- on a sector of the color wheel that is similar to your color\n- dropped at a corner that is similar to your spikiness.");

    c.lineWidth = 8;
    c.strokeStyle = "#ff5988";
    Utils.drawRoundedCornerRect(0, 10, 300, 310, 25);
    c.stroke();

    c.restore();



    // weapon

    c.save();
    c.translate(Game.width - Panel.WIDTH, 848);

    c.fillStyle = "#fff5f7";
    Utils.drawRoundedCornerRect(0, 10, 300, 212, 25);
    c.fill();

    c.fillStyle = "#ffd6e1";
    Utils.drawRoundedCornerRect(0, 10, 300, 74, 25);
    c.fill();

    this.title.drawPosText(20, 64, "Weapon");

    Img.drawScaled("powerFace", 200, 32, 0.62);

    if(websocketManager.id !== null && surpManager.surps.hasOwnProperty(websocketManager.id) && surpManager.surps[websocketManager.id].weapon !== -1) {
        let weapon = surpManager.surps[websocketManager.id].weapon;

        let sprites = [4, 0, 1, 2, 3, 5, 6];
        let titles = ["Tomatoes", "Bananas", "Apples", "Ice Cubes", "Blueberries", "Raspberries", "Kittens"];
        let color = ["red", "yellow", "green", "cyan", "purple", "pink"];

        Img.drawSpriteScaled("bullet", 75 - 36, 100, 72, 72, sprites[weapon], 0, 0.5);

        this.weaponTitle.drawPosText(75, 190, titles[weapon]);

        if(weapon < 6) {
            this.sideExplanation.drawPosText(146, 114, "Stun other players and color them " + color[weapon] + ".");
        } else {
            this.sideExplanation.drawPosText(146, 114, "Use cuteness to slow down other players.");
        }
        this.sideExplanation.drawPosText(146, 184, "Press SPACE to fire.");

    } else {

        this.weaponTitle.drawPosText(150, 136, "No Weapon");

        this.centeredExplanation.drawPosText(150, 180, "(There are boxes around the field that contain weapons.)");

    }

    c.lineWidth = 8;
    c.strokeStyle = "#ff5988";
    Utils.drawRoundedCornerRect(0, 10, 300, 212, 25);
    c.stroke();

    c.restore();

};


Panel.prototype.drawHighscore = function(highscore, number, y) {

    c.save();
    c.translate(0, y);

    let priColor = "#ff5988";
    let secColor = "#fff";

    if(highscore.id === websocketManager.id) {
        priColor = "#fff";
        secColor = "#ff5988";

        c.fillStyle = secColor;
        Utils.drawRoundedCornerRect(2, 0, 296, 36, 18);
        c.fill();
    }

    c.fillStyle = priColor;
    Utils.drawRoundedCornerRect(12, 4, 28, 28, 6);
    c.fill();

    this.highscoreNumber.setColor(secColor);
    this.highscoreNumber.drawPosText(26, 25, number.toString());

    this.playerName.setColor(priColor);
    this.playerName.drawPosText(48, 23, "Sir " + highscore.name + " Prise");

    Img.drawScaled("leaderboardBlueStar", 220, 9, 0.5);

    this.scoreValue.setColor(priColor);
    this.scoreValue.drawPosText(284, 23, Math.round(highscore.score).toString());

    c.restore();
};