function IngameScene() {}


IngameScene.show = function() {

    field = new Field();
    camera = new Camera();
    player = new Player();
    surpManager = new SurpManager();

    let tempHost = window.prompt("Please enter Host", "192.168.2.20");
    let tempName = window.prompt("Please enter your name, Sir Prise.", "");
    websocketManager = new WebsocketManager(tempHost, tempName);
    websocketManager.connect();

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
    camera.update();


};


IngameScene.draw = function() {

    field.draw();

    Tooltip.draw();

    PauseScreen.draw();
};
