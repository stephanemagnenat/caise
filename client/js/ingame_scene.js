function IngameScene() {}


IngameScene.show = function() {

    field = new Field();
    camera = new Camera();
    player = new Player();
    surpManager = new SurpManager();
    boxManager = new BoxManager();
    bulletManager = new BulletManager();

    let tempHost = window.prompt("Please enter Host", "192.168.2.20");
    let tempName = window.prompt("Please enter your name, Sir Prise.", "");
    websocketManager = new WebsocketManager(tempHost, tempName);
    websocketManager.connect();

    panel = new Panel();

    Keyboard.registerKeyDownHandler(Keyboard.SPACE_BAR, function() {
        player.shoot();
    });



};


IngameScene.hide = function() {


};


IngameScene.resize = function() {


};


IngameScene.click = function() {

};


IngameScene.update = function() {

    Tooltip.reset();

    player.updateControls();
    field.update();
    surpManager.update();
    bulletManager.update();
    camera.update();

    panel.update();

    player.updateMusic();

};


IngameScene.draw = function() {

    field.draw();

    player.draw();

    panel.draw();

    Tooltip.draw();
};
