function IngameScene() {}


IngameScene.show = function() {

    field = new Field();
    camera = new Camera();

};


IngameScene.hide = function() {


};


IngameScene.resize = function() {


};


IngameScene.click = function() {

};


IngameScene.update = function() {

    Tooltip.reset();

    field.update();
    camera.update();


};


IngameScene.draw = function() {

    field.draw();

    Tooltip.draw();

    PauseScreen.draw();
};
