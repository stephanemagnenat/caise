function LoadingScene() {}


LoadingScene.percentage = 0;


LoadingScene.show = function() {
    PreloadingManager.preload();
};


LoadingScene.hide = function() {
};


LoadingScene.update = function() {
    PreloadingManager.update();
    LoadingScene.percentage = PreloadingManager.getPercentageLoaded();
};


LoadingScene.draw = function() {

    c.fillStyle = "#61CF8F";
    c.fillRect(0, 0, Game.width, Game.height);

    if(Img.isLoaded("title")) {
        Img.drawScaled("title", Game.centerX - 270, Game.centerY - 333, 0.5);
    }

    c.fillStyle = "#ff5988";
    Utils.drawRoundedCornerRect(Game.centerX - 105, Game.height - 65, 210, 20, 5);
    c.fill();

    c.fillStyle = "#ffadad";
    c.fillRect(Game.centerX - 100, Game.height - 60, 200, 10);

    c.fillStyle = "#fff";
    c.fillRect(Game.centerX - 100, Game.height - 60, 200 * (LoadingScene.percentage / 100.0), 10);

};