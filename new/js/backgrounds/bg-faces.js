const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "faces";

infoText.innerHTML = "a neural net trained on my freshman yearbook + noise PCA";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "#0a0a0a"
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

const bigCanvas = document.createElement("canvas");
bigCanvas.width = 256
bigCanvas.height = 256
const bigCtx = bigCanvas.getContext('2d')

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    noise.seed(Math.random());
    update(0, 0, 0)
};

async function loadModel() {
    decoder = await tf.loadLayersModel('./models/faces/decoder/model.json');
    console.log("Model Loaded");
    init();
}

loadModel();

function drawFromRGB(arr, px, py) {
    for (var y = 0; y < 32; y++)
    {
        for (var x = 0; x < 32; x++)
        {
            ctx.fillStyle = `rgb(${Math.round((arr[0][y][x][0] + 1.9) * 65)}, ${Math.round((arr[0][y][x][1] + 1.9) * 65)}, ${Math.round((arr[0][y][x][2] + 1.9) * 65)})`
            ctx.fillRect(px + x*8, py + y*8, 8, 8);
        }
    }
}

function drawFromRGB_imdata(arr, px, py, fadeAlpha) {
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
    ctx.filter = `blur(4px) brightness(100%)`//(${Math.round(fadeAlpha*100)}%)`;

    delete imgData;
}

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawRow(time, curCellX, fadeAlpha) {
    if (decoder != null) {
        for (var y = 0; y < Math.ceil(window.innerHeight/256); y++) {
            if (curCellX+1 > Math.ceil(window.innerWidth/256)) {
                curCellX = 0;
            }
            tf.tidy(()=>{
                decode([[noise.simplex3((curCellX/7)+0, (y/7)+0, time)*2,
                        noise.simplex3((curCellX/7)+1, (y/7)+1, time)*2,
                        noise.simplex3((curCellX/7)+2, (y/7)+2, time)*2,
                        noise.simplex3((curCellX/7)+3, (y/7)+3, time)*2,
                        noise.simplex3((curCellX/7)+4, (y/7)+4, time)*2,
                        noise.simplex3((curCellX/7)+5, (y/7)+5, time)*2,
                        noise.simplex3((curCellX/7)+6, (y/7)+6, time)*2,
                        noise.simplex3((curCellX/7)+7, (y/7)+7, time)*2,
                        noise.simplex3((curCellX/7)+8, (y/7)+8, time)*2,
                        noise.simplex3((curCellX/7)+9, (y/7)+9, time)*2,
                        noise.simplex3((curCellX/7)+10, (y/7)+10, time)*2,
                        noise.simplex3((curCellX/7)+11, (y/7)+11, time)*2,
                        noise.simplex3((curCellX/7)+12, (y/7)+12, time)*2,
                        noise.simplex3((curCellX/7)+13, (y/7)+13, time)*2,
                        noise.simplex3((curCellX/7)+14, (y/7)+14, time)*2,
                        noise.simplex3((curCellX/7)+15, (y/7)+15, time)*2,
                        noise.simplex3((curCellX/7)+16, (y/7)+16, time)*2,
                        noise.simplex3((curCellX/7)+17, (y/7)+17, time)*2,
                        noise.simplex3((curCellX/7)+18, (y/7)+18, time)*2,
                        noise.simplex3((curCellX/7)+19, (y/7)+19, time)*2,]], curCellX * 32, y * 32, fadeAlpha);
            });
        }
        curCellX +=1
    }
    return curCellX;
}

async function decode(dense, x, y, fadeAlpha) {
    var rgb = await decoder.predict(tf.tensor(dense)).array();
    drawFromRGB_imdata(rgb, x, y, fadeAlpha);
}

function update(fadeAlpha, time, curCellX) {
    var t0 = performance.now()
    time += 0.001
    curCellX = drawRow(time, curCellX, fadeAlpha);
    
    if (decoder != null) { 
        if (fadeAlpha < 0.3) {
            fadeAlpha += 0.01
        }
    }
    var t1 = performance.now()
    //console.log(t1-t0)
    if (t1 - t0 < 300)
        setTimeout(()=>{update(fadeAlpha, time, curCellX)})
}