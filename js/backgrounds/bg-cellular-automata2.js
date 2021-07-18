document.getElementById("bg-name").innerHTML = "cellular_automata2";
document.getElementById("bg-info").innerHTML = "(not quite) rule 30 feeding a game of life";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const gcanvas = document.createElement("canvas");
const gctx = gcanvas.getContext('2d');

ctx.webkitImageSmoothingEnabled = false;
var cellSize = 6;
var map = null
var row = null
const rule = Array.from([...(30).toString(2).padStart(8, '0')].reverse(), e => parseInt(e)) // 45 is also cool
var boundary = 20

function elementaryRule(p1, p2, p3) {
    return rule[parseInt([p1, p2, p3].join(""), 2)]
}

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    update();
};
init();

function resizeCanvas() {
    canvas.width = window.innerWidth/cellSize;
    canvas.height = window.innerHeight/cellSize;
    gcanvas.width = canvas.width;
    gcanvas.height = canvas.height
    scaleMap(Math.ceil(canvas.width), Math.ceil(canvas.height));
}

function scaleMap(newSizeX, newSizeY) {
    map = Array.from(Array(newSizeY), () => new Array(newSizeX).fill(0))
    row = new Array(newSizeX).fill(0)
    row[Math.floor(row.length/2)] = 1

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function getScore(x, y) {
    return x < map[0].length && x > -1 && y < map.length && y > -1 ? Math.sign(map[y][x]) : Math.round(Math.random()/1.9)
}

function draw(draw=false) {
    m = JSON.parse(JSON.stringify(map));
    var alive = []
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[0].length; x++) {
            // 1d rule
            if (y == map.length - boundary) { 
                m[y][x] = elementaryRule(x-1 > -1 ? row[x-1] : Math.round(Math.random()), row[x], x+1 < map[0].length ? row[x+1] : Math.round(Math.random()))
                if (m[y][x] == 0) {
                    //dead.push([x, y])
                    //ctx.fillStyle = "black"
                }else{
                    alive.push([x, y])
                    //ctx.fillStyle = "white"
                }
                //ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
            else if (y > m.length - boundary) {
                m[y][x] = elementaryRule(x-1 > -1 ? m[y-1][x-1] : Math.round(Math.random()), m[y-1][x], x+1 < map[0].length ? m[y-1][x+1] : Math.round(Math.random()))
                if (m[y][x] == 0) {
                    //ctx.fillStyle = "black"
                }else{
                    alive.push([x, y])
                    //ctx.fillStyle = "white"
                }
                //ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
            if (y < m.length - boundary) {
                score = getScore(x-1, y+1)+getScore(x, y+1)+getScore(x+1, y+1)+getScore(x-1, y)+getScore(x+1, y)+getScore(x-1, y-1)+getScore(x, y-1)+getScore(x+1, y-1);
                //score += getScore(x-2, y)+getScore(x+2, y)+getScore(x, y+2)+getScore(x, y-2)
                if (((score == 3 || score == 2) && m[y][x] == 1) || ((score == 3 || score == 6) && m[y][x] == 0)) {
                    m[y][x] = 1
                    alive.push([x, y])
                }else{
                    m[y][x] = 0
                }
                //if (draw)
            }
        }
    }
    if(draw){
        gctx.globalAlpha = 0.03;
        gctx.fillStyle = "black"
        gctx.fillRect(0, 0, gcanvas.width, gcanvas.height);

        gctx.fillRect(0, gcanvas.height - boundary, gcanvas.width, boundary);
        gctx.globalAlpha = 1;

        gctx.fillStyle = "white"
        for (var i = 0; i < alive.length; i++) {
            gctx.fillRect(alive[i][0], alive[i][1], 1, 1);
        }
    }
    map = m
    row = m[m.length - boundary]
}

function hexToRgb(hex) {
    var hex = hex.substring(1);
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
}
function colorRamp() {
    const startColor = [162, 130, 18];
    const endColor = [28, 29, 33];
    const lerpSpeed = 0.1;
    var imageData = gctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    var numPixels = pixels.length;
    var once = false;
    for (var i = 0; i < numPixels; i++) {
        if (i * 4 > numPixels-1) {
            continue;
        }
        if (pixels[i*4+0] != 255){
            if (pixels[i*4+0] > 3) {
                var color = hexToRgb(d3.interpolateInferno(pixels[i*4+0]/255))

                pixels[i*4+0] = color.r
                pixels[i*4+1] = color.g
                pixels[i*4+2] = color.b
            }else{
                pixels[i*4+0] = 0
                pixels[i*4+1] = 0
                pixels[i*4+2] = 0
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
function update() {
    console.time("update");
    colorRamp()
    draw(true)
    window.requestAnimationFrame(update)
    console.timeEnd("update");
}