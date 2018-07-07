function WebsocketManager(host, playerName) {

    this.host = host;
    this.playerName = playerName;

    this.socket = null;
    this.id = null;

}


WebsocketManager.prototype.connect = function() {
    this.socket = new WebSocket("ws://" + this.host + ":6789/");
    this.socket.onopen = function() {
        websocketManager.registerPlayerName();
    };
    this.socket.onmessage = function(event) {
        websocketManager.processMessage(event);
    };
};


WebsocketManager.prototype.registerPlayerName = function() {
    this.socket.send(this.playerName);
};


WebsocketManager.prototype.processMessage = function(event) {
    let data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {
        case "player_welcome" :
            this.id = data.id;
            break;
        case "object_new" :
            /*objects[data.id] = data;
            if (data.object === 'player') {
                logArea.textContent += data.name + " connected\n";
            }*/
            break;
        /*case 'object_state':
            var object = objects[data.id];
            // update variables
            object.pos = data.pos;
            object.speed = data.speed;
            if (object.object === 'player') {
                // if hits were improved, set animation
                if (data.score > object.score) {
                    object.score_anim = 1;
                }
                // update variables
                object.score = data.score;
                object.has_ball = data.has_ball;
            }
            break;
        case 'object_part':
            var object = objects[data.id];
            if (object.object === 'player') {
                logArea.textContent += data.name + " disconnected\n";
            }
            delete objects[data.id];
            break;*/
        default:
            console.error("unsupported event", data);
    }
};


WebsocketManager.prototype.send = function(object) {
    if(this.socket === null || this.id === null) {
        return;
    }
    let json = JSON.stringify(object);
    this.socket.send(json);
};