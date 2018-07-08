function Grass() {

}


Grass.sprites = [
    { name : "grass03", x : 3409, y : 32, w : 339, h : 338 },
    { name : "grass06", x : 2887, y : 38, w : 126, h : 86 },
    { name : "grass10", x : 2199, y : 244, w : 628, h : 234 },
    { name : "grass13", x : 4045, y : 244, w : 496, h : 131 },
    { name : "grass16", x : 2955, y : 356, w : 274, h : 188 },
    { name : "grass21", x : 4420, y : 426, w : 43, h : 52 },
    { name : "grass24", x : 1898, y : 478, w : 145, h : 165 },
    { name : "grass28", x : 4709, y : 483, w : 151, h : 162 },
    { name : "grass31", x : 2624, y : 506, w : 121, h : 186 },
    { name : "grass34", x : 3999, y : 506, w : 145, h : 186 },
    { name : "grass38", x : 3625, y : 547, w : 265, h : 240 },
    { name : "grass43", x : 2866, y : 647, w : 667, h : 133 },
    { name : "grass48", x : 4162, y : 762, w : 314, h : 178 },
    { name : "grass51", x : 2265, y : 764, w : 330, h : 177 },
    { name : "grass56", x : 1424, y : 897, w : 453, h : 387 },
    { name : "grass59", x : 4864, y : 897, w : 455, h : 385 },
    { name : "grass64", x : 2076, y : 1100, w : 79, h : 78 },
    { name : "grass67", x : 4543, y : 1100, w : 57, h : 81 },
    { name : "grass74", x : 1572, y : 1516, w : 241, h : 223 },
    { name : "grass77", x : 4928, y : 1518, w : 272, h : 224 },
    { name : "grass80", x : 1843, y : 1643, w : 789, h : 82 },
    { name : "grass83", x : 4100, y : 1654, w : 789, h : 83 },
    { name : "grass86", x : 5465, y : 1654, w : 197, h : 659 },
    { name : "grass89", x : 1090, y : 1655, w : 265, h : 350 },
    { name : "grass96", x : 4989, y : 1829, w : 273, h : 124 },
    { name : "grass99", x : 1455, y : 1847, w : 290, h : 402 },
    { name : "grass104", x : 5137, y : 2078, w : 135, h : 171 },
    { name : "grass107", x : 1073, y : 2125, w : 123, h : 188 },
    { name : "grass114", x : 1107, y : 2451, w : 487, h : 321 },
    { name : "grass117", x : 5126, y : 2451, w : 536, h : 321 },
    { name : "grass121", x : 1471, y : 2789, w : 240, h : 332 },
    { name : "grass124", x : 5065, y : 2865, w : 137, h : 254 },
    { name : "grass127", x : 1112, y : 2913, w : 212, h : 125 },
    { name : "grass131", x : 1888, y : 3080, w : 739, h : 81 },
    { name : "grass134", x : 4096, y : 3080, w : 742, h : 77 },
    { name : "grass139", x : 1309, y : 3142, w : 222, h : 163 },
    { name : "grass142", x : 5238, y : 3142, w : 223, h : 161 },
    { name : "grass147", x : 1717, y : 3268, w : 116, h : 86 },
    { name : "grass150", x : 4945, y : 3269, w : 114, h : 84 },
    { name : "grass157", x : 4796, y : 3536, w : 442, h : 223 },
    { name : "grass159", x : 1894, y : 3542, w : 315, h : 334 },
    { name : "grass162", x : 1483, y : 3587, w : 289, h : 328 },
    { name : "grass166", x : 4341, y : 3768, w : 442, h : 441 },
    { name : "grass169", x : 2256, y : 3858, w : 371, h : 300 },
    { name : "grass173", x : 1647, y : 3968, w : 445, h : 237 },
    { name : "grass176", x : 3335, y : 4073, w : 266, h : 235 },
    { name : "grass179", x : 2754, y : 4141, w : 332, h : 105 },
    { name : "grass182", x : 3912, y : 4141, w : 120, h : 112 },
    { name : "grass190", x : 4160, y : 4272, w : 299, h : 230 },
    { name : "grass194", x : 3705, y : 4323, w : 120, h : 170 },
    { name : "grass197", x : 2323, y : 4329, w : 236, h : 173 },
    { name : "grass200", x : 3029, y : 4479, w : 277, h : 186 },

    { name : "rounded", x : 264,  y : 144, w : 432, h : 432 },
    { name : "spiky", x : 6024, y : 144, w : 432, h : 432 },
    { name : "spiky", x : 264, y : 4224, w : 432, h : 432 },
    { name : "rounded", x : 6024, y : 4224, w : 432, h : 432 },
];


Grass.prototype.draw = function() {

    c.save();
    c.translate(-70, -50);
    c.scale(0.0208333, 0.0208333);

    let view = camera.getRenderLimitsInRetinaGraphicCoords();


    let sprite;
    for(let i = 0; i < Grass.sprites.length; i++) {
        sprite = Grass.sprites[i];
        if(sprite.x < view.endX && sprite.x + sprite.w > view.startX
            && sprite.y < view.endY && sprite.y + sprite.h > view.startY) {
            Img.draw(sprite.name, sprite.x, sprite.y);
        }
    }


    c.restore();

};