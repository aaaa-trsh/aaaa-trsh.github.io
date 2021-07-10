const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "cellular_automata";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const gcanvas = document.createElement("canvas");
const gctx = gcanvas.getContext('2d');
const resetTime = 500;
const blurTime = 7;
const fadeTime = 5;
const colorSchemes = [[["#0c0d1a", "#239989", "#FDE725"], "yello-green"],
                      [["#0A0F0D", "#2A1E5C", "#EE4266"], "pink razzmatazz"],
                      [["#000022", "#40612d", "#61FF7E"], "gameboy"],
                      [["#000022", "#001242", "#0094C6"], "ocean"]];
var cellSize = Math.min(window.innerWidth, window.innerHeight) / 100;
var rules = [
    //[[3, 4, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], "diamonds"], 
    //[[3, 5, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], "mold w/o death"],
    //[[3, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], "plow world"],
    //[[2, 5, 6, 7, 8], [5, 6, 7, 8], "iceball"]
    [[2, 5, 6, 7, 8], [5, 6, 7, 8], "iceball"]
];
function checkRules(score) {
    switch(3) {
        case 0: // diamonds
            return [(score == 3 || score == 4 || score == 7 || score == 8), score != 0];
        case 1:
            return [(score == 3 || score == 5 || score == 7 || score == 8), score != 0]
        case 2:
            return [(score == 3 || score == 7 || score == 8), score != 0]
        case 3:
            return [(score == 2 || score == 5 || score == 6 || score == 7 || score == 8), score != 0 && score > 4]
    }

}
var preloadedColorSchemes = [];
var curScheme = 0;
var curRule = 0;
var map = Array.from(Array(2), () => new Array(4));
var prevMap;

function init() {
    for (var i = 0; i < colorSchemes.length; i++) {
        var gradient = []
        for (var k = 0; k < 50; k++){ gradient.push(percentageToColor(k/50)); }
        preloadedColorSchemes.push([gradient, colorSchemes[i][1]])
        curScheme+=1
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    randomize();
    curScheme = Math.floor(Math.random()*4)
    curRule = Math.floor(Math.random()*4)
    update();
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
init();

function resizeCanvas() {
    canvas.width = Math.ceil(window.innerWidth/cellSize);
    canvas.height = Math.ceil(window.innerHeight/cellSize);
    gcanvas.width = canvas.width;
    gcanvas.height = canvas.height
    scaleMap(Math.ceil(canvas.width), Math.ceil(canvas.height));
}

function lerpColor(a, b, amount) { 
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function percentageToColor(percentage) {
    percentage %= 1
    if (percentage > 0.5) { return lerpColor(colorSchemes[curScheme][0][1], colorSchemes[curScheme][0][2], (percentage-0.5)*2); }
    else { return lerpColor(colorSchemes[curScheme][0][0], colorSchemes[curScheme][0][1], percentage*2); }
}

function percentageToPreloadedColorScheme(percentage) {
    percentage = Math.round((percentage % 1)*preloadedColorSchemes[0][0].length)
    return preloadedColorSchemes[curScheme][0][percentage]
}

function getScore(x, y) {
    return x < map[0].length && x > -1 && y < map.length && y > -1 ? Math.sign(map[y][x]) : 0
}

function drawRow(y) {
    for (var x = 0; x < map[y].length; x++)
    {
        score = getScore(x-1, y+1)+getScore(x, y+1)+getScore(x+1, y+1)+getScore(x-1, y)+getScore(x+1, y)+getScore(x-1, y-1)+getScore(x, y-1)+getScore(x+1, y-1);
        birthOrSurvive = checkRules(score) 
        if (birthOrSurvive[0]) {
            if (map[y][x] == 1) {
                map[y][x] = 0.5;
            }
            else if (map[y][x] == 0) {
                map[y][x] = 1;
            }
        }else if (!birthOrSurvive[1]) {
            map[y][x] = 0;
        }

        if (Math.random() > 0.99996){ map[y][x] = 1; }
        
        if (map[y][x] == 1) {
            value = map[y][x]*256
            gctx.fillStyle = `rgb(${value}, ${value}, ${value})` //percentageToPreloadedColorScheme(map[y][x]/2)
            gctx.fillRect(x, y, 1, 1);
        }
    }
}
function cellularAutomata(i) {
    //fade = i < (blurTime)
    //prefade = i - (resetTime-blurTime)
    //var newMap = map
    //var prevMap = JSON.parse(JSON.stringify(map));
    //prefade *= 2
    //if (fade) {
    //    ctx.globalAlpha = 0.1;
    //    ctx.fillStyle = "#0a0a0a"
    //    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    //    ctx.globalAlpha = 1.0;
    //}
    gctx.globalAlpha = 0.05;
    gctx.fillStyle = "#0a0a0a"
    gctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    gctx.globalAlpha = 1.0;
    var prevMap = map.map(function(arr) {
        return arr.slice();
    });
    for (var y = 0; y < map.length; y++)
    {
        drawRow(y)
    }
    return map
}

function shuffle(arr) {
    return arr
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)
}

function randomize() {
    noise.seed(Math.random())
    for (var y = 0; y < map.length; y++)
    {
        for (var x = 0; x < map[0].length; x++)
        {
            if ((noise.simplex2(x/400, y/400)+1)/2 < 0.4) {
                map[y][x] = 0.5;
            }else{ map[y][x] = 0; }
        }
    }
    //curScheme = Math.floor(Math.random()*4)
    //curRule = Math.floor(Math.random()*4)
    //if (curScheme == colorSchemes.length) {
    //    preloadedColorSchemes = shuffle(preloadedColorSchemes)
    //}
    //if (curRule == rules.length) {
    //    rules = shuffle(rules)
    //}
    curScheme = curScheme%colorSchemes.length
    curRule = curRule%rules.length
    infoText.innerHTML = `rule: ${rules[curRule][2]} - color: ${preloadedColorSchemes[curScheme][1]}`
}

function scaleMap(newSizeX, newSizeY) {
    map = Array.from(Array(newSizeY), () => new Array(newSizeX))
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    randomize()
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
                var color = hexToRgb(d3.interpolateMagma(pixels[i*4+0]/255))

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

var i = 0;
function update() {
    i++;
    map = cellularAutomata(i);
    colorRamp()
    window.requestAnimationFrame(update)
}