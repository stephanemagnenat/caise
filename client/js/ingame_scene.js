function IngameScene() {}


IngameScene.show = function() {

    field = new Field();
    camera = new Camera();
    player = new Player();
    surpManager = new SurpManager();
    boxManager = new BoxManager();
    bulletManager = new BulletManager();

    let tempHost = window.prompt("IMPORTANT: We are currently setting up a server, it should be ready Monday morning.\n(Alternatively you can download the server's Python 3.7 script from http://www.zyxer.net/egj5/server.zip)\n\nPlease enter server address:", "192.168.2.20");
    let tempName = window.prompt("Please enter your name, Sir Prise:", "");
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
