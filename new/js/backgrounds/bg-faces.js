const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "bg: faces";
infoText.innerHTML = "simplex, going to be used to control face parameters";
var cellSize = 256;

const bgColor = "#0a0a0a";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const bigCanvas = document.createElement("canvas");
bigCanvas.width = cellSize
bigCanvas.height = cellSize
const bigCtx = bigCanvas.getContext('2d')
bigCtx.imageSmoothingEnabled = false;

var curRow = 0;
var map = [];
var time = 0;
var decoder = null;
var canDecode = false;
var curCellX = 0;
var curCellY = 0;
var loops = 0;
var fadeAlpha = 0;

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    noise.seed(Math.random());
    loadModel();

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    setTimeout(
        update
    , 10)
    //update();
};
init();

async function loadModel() {
    decoder = await tf.loadLayersModel('./models/faces/decoder/model.json');
    console.log("Model Loaded");
    canDecode = true;
    
}

function drawFromRGB(arr, px, py) {
    for (var y = 0; y < 32; y++)
    {
        for (var x = 0; x < 32; x++)
        {
            ctx.fillStyle = `rgb(${Math.round((arr[0][y][x][0] + 1.9) * 65)}, ${Math.round((arr[0][y][x][1] + 1.9) * 65)}, ${Math.round((arr[0][y][x][2] + 1.9) * 65)})`
            ctx.fillRect(px + x*8, py + y*8, 8, 8);
            //console.log(`rgb(${Math.round((arr[0][y][x][0] + 1.9) * 65)}, ${Math.round((arr[0][y][x][2] + 1.9) * 65)}, ${Math.round((arr[0][y][x][2] + 1.9) * 65)})`)
        }
    }
}

function drawFromRGB_imdata(arr, px, py) {
    ctx.setTransform(10,0,0,10,0,0);

    arr = arr[0]
    var imgData = ctx.createImageData(32, 32);
    for (var y = 0; y < 32; y++)
    {
        for (var x = 0; x < 32; x++)
        {
            imgData.data[(y * 32 + x)*4+0] = (arr[y][x][0] + 1.9) * 65
            imgData.data[(y * 32 + x)*4+1] = (arr[y][x][1] + 1.9) * 65
            imgData.data[(y * 32 + x)*4+2] = (arr[y][x][2] + 1.9) * 65
            imgData.data[(y * 32 + x)*4+3] = 255
        }
    }
    bigCtx.putImageData(imgData, px, py);

    ctx.drawImage(bigCanvas, 0, 0)
    ctx.filter = `blur(4px) brightness(${Math.round(fadeAlpha*100)}%)`;

    delete imgData;
}

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cellSize = 256;
    scaleMap(Math.ceil(canvas.width/cellSize), Math.ceil(canvas.height/cellSize));
}

function scaleMap(newSizeX, newSizeY) {
    map = Array.from(Array(newSizeY), () => new Array(newSizeX).fill([Array.from({length: 20}, () => 0)]))
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function draw() {
    if (canDecode) {
        if (curCellY+1 > Math.ceil(window.innerHeight/cellSize)) {
            curCellX += 1
            curCellY = 0
            console.log("ayo wrap to next col")

            if (curCellX+1 > Math.ceil(window.innerWidth/cellSize)) {
                loops += 1
                console.log("ayo wrap back around")
                curCellX = 0
            }
        }
        for (var i = 0; i < 20; i++) { map[curCellY][curCellX][0][i] = noise.simplex3((curCellX/10)+i, (curCellY/10)+i, time)*2; }
        decode(map[curCellY][curCellX], curCellX * cellSize, curCellY * cellSize);
        curCellY += 1
        ctx.strokeStyle = `yellow`
        ctx.lineWidth = 8;
        ctx.strokeRect(curCellX * cellSize+4, curCellY * cellSize+4, cellSize-8, cellSize-8);
    }
}

function drawRow() {
    if (canDecode){
        for (var y = 0; y < Math.ceil(window.innerHeight/cellSize); y++) {
            curCellY = y

            if (curCellX+1 > Math.ceil(window.innerWidth/cellSize)) {
                loops += 1
                curCellX = 0
            }
            for (var i = 0; i < 20; i++) { map[y][curCellX][0][i] = noise.simplex3((curCellX/7)+i, (y/7)+i, time)*2; }
            decode(map[y][curCellX], curCellX * 32, y * 32);
        }
        curCellX +=1
    }
    
}

async function decode(dense, x, y) {
    var rgb = await decoder.predict(tf.tensor(dense)).array();
    drawFromRGB_imdata(rgb, x, y);
    delete rgb;
}
function update() {
    var t0 = performance.now()
    time += 0.002
    drawRow();
    
    if (canDecode) { 
        if (fadeAlpha < 0.3) {
            fadeAlpha += 0.01
        }
    }
    var t1 = performance.now()
    //console.log(t1-t0)
    setTimeout(update)
}