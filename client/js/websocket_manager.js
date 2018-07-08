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

            } else if(data.object === "box") {
                boxManager.addBox(data);

            } else if(data.object === "ball") {
                field.addBall(data);

            } else {
                console.log(data);
            }
            /*objects[data.id] = data;
            if (data.object === 'player') {
                logArea.textContent += data.name + " connected\n";
            }*/
            break;

        case "object_state" :
            if(surpManager.isSurp(data.id)) {
                surpManager.updateSurp(data.id, data);

            } else if(boxManager.isBox(data.id)) {
                boxManager.updateBox(data.id, data);

            } else if(field.isBall(data.id)) {
                field.updateBall(data);

            } else {
                console.log(data);
            }
            break;

        case "object_part" :
            if(surpManager.isSurp(data.id)) {
                surpManager.deleteSurp(data.id);

            } else if(boxManager.isBox(data.id)) {
                boxManager.deleteBox(data.id);

            } else if(field.isBall(data.id)) {
                field.deleteBall();

            } else {
                console.log(data);
            }
            break;

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