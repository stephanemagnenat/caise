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

    switch (data.type) {

        case "player_welcome" :
            this.id = data.id;
            break;

        case "object_new" :
            if(data.object === "player") {
                surpManager.addSurp(data);
            } else {
                console.log(data);
            }
            /*objects[data.id] = data;
            if (data.object === 'player') {
                logArea.textContent += data.name + " connected\n";
            }*/
            break;

        case "object_state":
            if(surpManager.isSurp(data.id)) {
                surpManager.updateSurp(data.id, data);
            } else {
                console.log(data);
            }
            break;
        /*case 'object_part':
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