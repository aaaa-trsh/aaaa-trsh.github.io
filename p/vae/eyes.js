const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "white"
ctx.fillRect(0, 0, canvas.width, canvas.height)
var decoder;
const size = 32
const scale = 5
canvas.width = size * scale * 16
canvas.height = size * scale * 16
var sliders = Array.from(Array(10).keys()).map(i => document.getElementById(`pca${i+1}`))
var clientX = 0;
var clientY = 0;
var mFalloff = 2;
var mMax = Math.sqrt(2)/2;
var grid = [4, 4]
/**
 * 1 = 100%
 * 2 = style
 * 3 = 0% up 100% middle
 * 4 = 0% left 100% right
 * 5 = style
 * 8 = 0%
 * 
 */
const states = {
    "right" : {"dense":[-0.49567154,-0.33185095,0.45357603,-0.606544,1.8279805,1.0811944,-1.1985527,0.33231968,-0.01081904,0.104898416], "boost":1.6},
    //"left" : {"dense":[2,-2,1.575,-1.545,0.677,1.226,-0.704,-1.088,0.007,-1.807], "boost":1, "styles":[[9, -2, 0], [7, -1, 0], [1, 0, 2]]},
    "left" : {"dense":[2,-2,1.575,-1.545,0.677,1.226,-0.704,-1.088,0.007,-1.807], "boost":1},
    "down" : {"dense":[-0.133,-2,0.513,-0.866,1.868,-1.638,-1.38,0.521,-0.153,-0.874], "boost":2},
    "up" : {"dense":[1.244,-1.975,-1.139,-0.359,1.573,1.741,-0.355,-0.058,0.446,-0.474], "boost":1.2},
    "closed" : {"dense":[0.18,1.21,-1.44,-0.4,1.5,2.25,-0.32,-0.07,-0.94,-0.73], "boost": 1}
}
var dirStates = {}
for (const key of Object.keys(states)) {
    var state = states[key].dense
    dirStates[key] = state.map(x => x*states[key].boost)
}
function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
function lerpValues(value1, value2, t, out) {
    if (typeof value1 === 'number'
            && typeof value2 === 'number')
        return lerp(value1, value2, t)
    else { //assume array
        var len = Math.min(value1.length, value2.length)
        out = out||new Array(len)
        for (var i=0; i<len; i++)
            out[i] = lerp(value1[i], value2[i], t)
        return out
    }
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

function mixStates(dirStates, mixX, mixY, dist) {
    return lerpValues(lerpValues(dirStates["right"], dirStates["left"], mixX), lerpValues(dirStates["down"], dirStates["up"], mixY), .5)//, dirStates["closed"], clamp(dist, 0, 1))
}

async function loadModel() {
    decoder = await tf.loadLayersModel('./models/faces/decoder2/model.json');
    console.log("Model Loaded");
    //"2,-2,1.575,-1.545,0.677,1.226,-0.704,-1.088,0.007,-1.807" left  (style: 10 = -2. 0., 8 = -1. 0., 2 = 0. 2.)
    //"-0.133,-2,0.513,-0.866,1.868,-1.638,-1.38,0.521,-0.153,-0.874" down  (style: 7 = 1. -1., 8 = 1. -1.)
    //"1.8297801, -0.4157947, -1.0119464, 1.4034479, 2.1065679, 1.3560127, 0.82890403, -0.5186312, -0.1627591, 1.1094365" right  (style: 10 = -1.2 2., 8 = -1. 0., 1 = 1.5, 2)
    //"-1.223151,0.59306544,-0.99677056,1.2815813,1.6780939,-1.026062,2.2234292,0.16185719,-1.8529218,-0.88207924" right2  (style: 3 = -2. -1.)
    //"1.244,-1.975,-1.139,-0.359,1.573,1.741,-0.355,-0.058,0.446,-0.474" up  (style: 8 = -2. 0.)
    //setSliders()
    //setTimeout(tf.tidy(()=>{
    //    decode([Array.from({length: 10}, () => ((Math.random()-0.5)*2))], 0, 0)
    //    decode([Array.from({length: 10}, () => ((Math.random()-0.5)*2))], 1*scale*size, 0)
    //}), 1)
    update()
}
window.addEventListener('mousemove', (e) => { 
    clientX = e.clientX
    clientY = e.clientY
    //console.log(mx, my)
});

loadModel();

function setSliders(arr) { 
    for (var i = 0; i < arr.length; i++) {
        sliders[i].value = arr[i].toString();
    }
}
function drawFromRGB_imdata(arr, px, py) {
    ctx.setTransform(10,0,0,10,0,0);
    arr = arr[0]

    var imgData = ctx.createImageData(size * scale, size * scale);
    for (var y = 0; y < size * scale; y+=scale)
    {
        for (var x = 0; x < size * scale; x+=scale)
        {
            var pixX = Math.round(x/scale)
            var pixY = Math.round(y/scale)
            for (var oy = 0; oy < scale; oy++) {
                for (var ox = 0; ox < scale; ox++) {
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+0] = ((arr[pixY][pixX][0] + 1.9) * 65)
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+1] = ((arr[pixY][pixX][1] + 1.9) * 65)
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+2] = ((arr[pixY][pixX][2] + 1.9) * 65)
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+3] = 255 * clamp((Math.sin(pixX/(size) * Math.PI) * Math.sin(pixY/(size) * Math.PI))*4, 0, 1)
                }
            }
        }
    }

    ctx.putImageData(imgData, px, py)
    ctx.setTransform(1,0,0,1,0,0);
}

function getStates() {
    var dirStates = {}
    for (const key of Object.keys(states)) {
        var state = states[key].dense
        dirStates[key] = state.map(x => x*states[key].boost)
    }
    return mixStates(dirStates, mx+0.5, my+0.5)
}

async function decode(dense, x, y) {
    var rgb = await decoder.predict(tf.tensor(dense)).array();
    drawFromRGB_imdata(rgb, x, y);
}

function update() {
    
    
    for (var y = 0; y < grid[1]; y++) {
        for (var x = 0; x < grid[0]; x++) {
            var mx = (-clientX + (x*scale*size))/(window.innerWidth/mFalloff);
            var my = (-clientY + (y*scale*size))/(window.innerHeight/mFalloff);
            angle = Math.atan2(my, mx)
            mx = Math.cos(angle)
            my = Math.sin(angle)
            
            tf.tidy(()=>{
                decode([mixStates(dirStates, mx+0.5, my+0.5)], x*scale*size, y*scale*size)
            });
        }
    }
    setTimeout(update, 0)

}