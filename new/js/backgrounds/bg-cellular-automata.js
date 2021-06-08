const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "cellular_automata";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const resetTime = 50;
const blurTime = 7;
const fadeTime = 5;
const bgColor = "#0a0a0a";
const colorSchemes = [[["#0c0d1a", "#239989", "#FDE725"], "yello-green"],
                        [["#0A0F0D", "#2A1E5C", "#EE4266"], "pink razzmatazz"],
                        [["#000022", "#40612d", "#61FF7E"], "gameboy"],
                        [["#000022", "#001242", "#0094C6"], "ocean"]];

var cellSize = -1;
var rules = [[[3, 4, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], "diamonds"], 
                [[3, 5, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], "mold w/o death"],
                [[3, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], "plow world"],
                [[2, 5, 6, 7, 8], [5, 6, 7, 8], "iceball"]];
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
    randomize()
    update();
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
};
init();

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cellSize = 20000/(window.innerWidth);
    scaleMap(Math.ceil(canvas.width/cellSize), Math.ceil(canvas.height/cellSize));
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

function drawRow(y, prevMap, prefade) {
    for (var x = 0; x < map[y].length; x++)
    {
        score = getScore(x-1, y+1)+getScore(x, y+1)+getScore(x+1, y+1)+getScore(x-1, y)+getScore(x+1, y)+getScore(x-1, y-1)+getScore(x, y-1)+getScore(x+1, y-1);
        if (rules[curRule][0].includes(score)) {
            map[y][x] += 0.05;
        }else if (!rules[curRule][1].includes(score)) {
            map[y][x] = 0;
        }
        if (map[y][x] > 0.3) {
            map[y][x] -= 0.15
        }
        if (prevMap[y][x] == 0 && map[y][x] > 0) {
            map[y][x] = 2;
        }

        if (Math.random() > 0.9999){ map[y][x] = 2; }
        
        if (map[y][x] != 0) {
            if (prefade > 0) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = percentageToPreloadedColorScheme(map[y][x]/2)
                ctx.fillRect(x*cellSize - prefade, y*cellSize - prefade, cellSize + prefade*2, cellSize + prefade*2);
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillStyle = percentageToPreloadedColorScheme(map[y][x]/2)
                ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
        }
    }
}
function cellularAutomata(fade=false, prefade) {
    //var newMap = map
    //var prevMap = JSON.parse(JSON.stringify(map));
    prefade *= 2
    if (fade) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = 1.0;
    }
    var prevMap = map.map(function(arr) {
        return arr.slice();
    });
    for (var y = 0; y < map.length; y++)
    {
        drawRow(y, prevMap, prefade);
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
            if ((noise.simplex2(x/20, y/20)+1)/2 < 0.1) {
                map[y][x] = 1;
            }else{ map[y][x] = 0; }
        }
    }
    curScheme++
    curRule++
    if (curScheme == colorSchemes.length) {
        preloadedColorSchemes = shuffle(preloadedColorSchemes)
    }
    if (curRule == rules.length) {
        rules = shuffle(rules)
    }
    curScheme = curScheme%colorSchemes.length
    curRule = curRule%rules.length
    infoText.innerHTML = `rule: ${rules[curRule][2]} - color: ${preloadedColorSchemes[curScheme][1]}`
}

function scaleMap(newSizeX, newSizeY) {
    map = Array.from(Array(newSizeY), () => new Array(newSizeX))
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    randomize()
}

var i = 0;
function update() {
    map = cellularAutomata(i < (blurTime), i - (resetTime-blurTime));
    i++;
    
    if (i == resetTime) {
        randomize()
        i = 0;
    }
    window.requestAnimationFrame(update);
}