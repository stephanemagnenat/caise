function BulletManager() {
    this.bullets = {};

    this.rotation = 0;
}


BulletManager.prototype.addBullet = function(data) {
    this.bullets[data.id] = {
        id : data.id,
        pos : new Vec2(data.pos[0], data.pos[1]),
        speed : new Vec2(data.speed[0], data.speed[1]),
        weapon : data.weapon,
        offset : Utils.randFloat(0, TWO_PI)
    };
    if(surpManager.initialConnectTime < 1.0) {
        Sound.play("fire");
    }
};


BulletManager.prototype.isBullet = function(id) {
    return this.bullets.hasOwnProperty(id);
};


BulletManager.prototype.deleteBullet = function(id) {
    // TODO particle system
    delete this.bullets[id];
};


BulletManager.prototype.update = function() {
    let bullet;
    for(let i in this.bullets) {
        bullet = this.bullets[i];
        bullet.pos = bullet.pos.add(bullet.speed.multiply(Timer.delta));
    }

    this.rotation += Timer.delta * 8;
    if(this.rotation > TWO_PI) {
        this.rotation -= TWO_PI;
    }
};


BulletManager.prototype.draw = function() {

    let sprites = [4, 0, 1, 2, 3, 5, 6];

    let bullet;
    for(let i in this.bullets) {
        bullet = this.bullets[i];

        c.save();
        c.translate(bullet.pos.x, bullet.pos.y);
        c.translate(0, -1);
        c.rotate((this.rotation + bullet.offset) * Math.sign(bullet.speed.x));

        Img.drawSpriteScaled("bullet", -1.5, -1.5, 3, 3, sprites[bullet.weapon], 0, 0.0208333);

        c.restore();
    }
};