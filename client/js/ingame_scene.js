function IngameScene() {}


IngameScene.show = function() {

    field = new Field();
    camera = new Camera();
    player = new Player();
    surpManager = new SurpManager();
    boxManager = new BoxManager();
    bulletManager = new BulletManager();

    let tempHost = "";
    while(tempHost === null || tempHost === "") {
        tempHost = window.prompt("      The public server's address is:\n      ma.zyxer.net\n\n      Alternatively you can download the server's Python 3.6+ script from:\n      http://www.zyxer.net/egj5/server.zip\n\n\nPlease enter the server's address:\n ", "ma.zyxer.net");
    }
    let tempName = "";
    while(tempName === null || tempName === "" || tempName.length > 10) {
        if(tempName === null || tempName === "") {
            tempName = window.prompt("Please enter your first name, Sir Prise:", "");
        } else {
            tempName = window.prompt("Your name cannot have more than 10 characters.\n\nPlease enter your first name, Sir Prise:", "");
        }
        tempName = tempName.trim();
    }
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
