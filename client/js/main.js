var canvas;
var c;

var field;
var camera;
var player;
var surpManager;
var websocketManager;
var panel;


jQuery(document).ready(function() {

    canvas = document.getElementById("game");
    c = canvas.getContext("2d");

    Timer.init();
    PerformanceMonitor.init();

    PageVisibility.init();

    Keyboard.init();
    Mouse.init();

    Game.start();
});