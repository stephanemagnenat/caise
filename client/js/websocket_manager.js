function WebsocketManager(host, playerName) {

    this.host = host;
    this.playerName = playerName;

    this.socket = null;
    this.id = null;

    this.failed = false;

}


WebsocketManager.prototype.connect = function() {
    this.socket = new WebSocket("ws://" + this.host + ":40000/");
    this.socket.onopen = function() {
        websocketManager.registerPlayerName();
    };
    this.socket.onmessage = function(event) {
        websocketManager.processMessage(event);
    };
    this.socket.onerror = function() {
        alert("Could not connect to the server.");
        websocketManager.failed = true;
    };
    this.socket.onclose = function() {
        if(!websocketManager.failed) {
            alert("You were disconnected from the server.");
        }
    };
};


WebsocketManager.prototype.registerPlayerName = function() {
    this.socket.send(this.playerName);
};


WebsocketManager.prototype.processMessage = function(event) {

    let data = JSON.parse(event.data);

    switch (data.type) {

        case "player_welcome" :
            Sound.play("spawn");
            this.id = data.id;
            break;

        case "object_new" :
            if(data.object === "bullet") {
                bulletManager.addBullet(data);

            } else if(data.object === "player") {
                surpManager.addSurp(data);

            } else if(data.object === "box") {
                boxManager.addBox(data);

            } else if(data.object === "ball") {
                field.addBall(data);

            } else {
                console.log(data);
            }
            break;

        case "object_state" :
            if(surpManager.isSurp(data.id)) {
                surpManager.updateSurp(data.id, data);

            } else if(field.isBall(data.id)) {
                field.updateBall(data);

            } else {
                console.log(data);
            }
            break;

        case "object_part" :
            if(bulletManager.isBullet(data.id)) {
                bulletManager.deleteBullet(data.id);

            } else if(surpManager.isSurp(data.id)) {
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