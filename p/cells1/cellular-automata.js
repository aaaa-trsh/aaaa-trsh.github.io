const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const rect = canvas.getBoundingClientRect();

const gcanvas = document.createElement("canvas");
const gctx = gcanvas.getContext('2d', { willReadFrequently: true });
const rule = [[2, 5, 6, 7, 8], [5, 6, 7, 8]];
const COLOR_PALETTES = [
    (value) => {
        const color = cvtColor(d3.interpolateInferno(value));
        color.r *= 1.4;
        color.g /= 1.2;
        color.b /= 1.3;
        return [color, "INFERNO"]
    },
    (value) => [cvtColor(d3.interpolateViridis(value)), "VIRIDIS"],
    (value) => [cvtColor(d3.interpolatePlasma(Math.pow((value), 3))), "PLASMA"],
];
const COLOR_PALETTE = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

document.getElementById("info").innerHTML = `cellular automata B25678/S5678 ${COLOR_PALETTE(0)[1]} (reload to change colors! )`;

var map = Array.from(Array(2), () => new Array(4));

let mx, my = 0
function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    // randomize();
    update();
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousemove', function(evt) {
        mx = (evt.pageX - rect.left)/20;
        my = (evt.pageY - rect.top)/20;
        // gctx.fillStyle = `rgb(${255}, ${0}, ${255})`
        // gctx.fillRect(x, y, 1, 1);
    }, false);
};
init();

function resizeCanvas() {
    var cellSize = 20;
    canvas.width = Math.ceil(canvas.clientWidth/cellSize);
    canvas.height = Math.ceil(canvas.clientHeight/cellSize);
    gcanvas.width = canvas.width;
    gcanvas.height = canvas.height
    scaleMap(Math.ceil(canvas.width), Math.ceil(canvas.height));
}

function getScore(x, y) {
    return x < map[0].length && x > -1 && y < map.length && y > -1 ? Math.sign(map[y][x]) : 0
}

function cellularAutomata(i) {
    gctx.globalAlpha = 0.07;
    gctx.fillStyle = "#0a0a0a"
    gctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    gctx.globalAlpha = 1.0;

    for (var y = 0; y < map.length; y++)
    {
        for (var x = 0; x < map[y].length; x++)
        {
            score = getScore(x-1, y+1) +
                    getScore(x,   y+1) + 
                    getScore(x+1, y+1) + 
                    getScore(x-1, y  ) + 
                    getScore(x+1,   y) + 
                    getScore(x-1, y-1) + 
                    getScore(x,   y-1) + 
                    getScore(x+1, y-1);

            if (rule[0].includes(score)) {
                map[y][x] = map[y][x] == 1 ? 0.5 : (map[y][x] == 0 ? 1 : map[y][x]);
            }
            else if (!rule[1].includes(score)) {
                map[y][x] = 0;
            }

            // if (Math.random() > 0.999) map[y][x] = 1; 
            //if (Math.random() > Math.hypot(Math.abs((x/map[0].length) - 0.5), Math.abs((y/map.length) - 0.5)) * 30) map[y][x] = 1; 
            
            if (map[y][x] == 1) {
                value = map[y][x] * 256;
                gctx.fillStyle = `rgb(${value}, ${value}, ${value})`
                gctx.fillRect(x, y, 1, 1);
            }
        }
    }
    return map
}


function randomize() {
    noise.seed(Math.random())
    for (var y = 0; y < map.length; y++)
    {
        for (var x = 0; x < map[0].length; x++)
        {
            //if ((noise.simplex2(x / 400, y / 400) + 1) / 2 < 0.4) map[y][x] = 0.5;
            if (Math.random() > (noise.simplex2(x / 50, y / 50))) map[y][x] = 0.5; 
            //else map[y][x] = 0; 
        }
    }
}

function scaleMap(newSizeX, newSizeY) {
    map = Array.from(Array(newSizeY), () => new Array(newSizeX))
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    randomize();
}

function cvtColor(hex) {
    if (hex.includes("rgb")) {
        hex = hex.substring(4, hex.length-1);
        var rgb = hex.split(", ");
        return {
            r: parseInt(rgb[0]), 
            g: parseInt(rgb[1]), 
            b: parseInt(rgb[2])
        };
    }
    // console.log(hex);
    var hex = hex.substring(1);
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
}

function colorRamp() {
    var imageData = gctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    var numPixels = pixels.length;
    for (var i = 0; i < numPixels; i++) {
        if (i * 4 > numPixels - 1) {
            break;
        }
        if (pixels[i*4+0] != 255) {
            if (pixels[i*4+0] > 3) {
                var value = pixels[i*4+0];
                var color = COLOR_PALETTE(value/255);
                pixels[i*4+0] = (((value/100 + 0.1) * color[0].r/255) / 2) * 255
                pixels[i*4+1] = (((value/100 + 0.1) * color[0].g/255) / 2) * 255
                pixels[i*4+2] = (((value/100 + 0.1) * color[0].b/255) / 2) * 255
            } else {
                pixels[i*4+0] = 0;
                pixels[i*4+1] = 0;
                pixels[i*4+2] = 0;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

var i = 0;
function update() {
    // if (i % 1000 == 0) randomize();
    i++;
    map = cellularAutomata(i);

    colorRamp();
    window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);