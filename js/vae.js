const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.fillStyle = "white"
ctx.fillRect(0, 0, canvas.width, canvas.height)
var decoder;
const size = 32
const scale = 10
canvas.width = size * scale
canvas.height = size * scale
var sliders = Array.from(Array(10).keys()).map(i => document.getElementById(`pca${i+1}`))
var mx;
var my;
/**
 * 1 = 100%
 * 2 = style
 * 3 = 0% up 100% middle
 * 4 = 0% left 100% right
 * 5 = style
 * 8 = 0%
 * 
 */
async function loadModel() {
    decoder = await tf.loadLayersModel('./models/faces/decoder2/model.json');
    console.log("Model Loaded");
    //"2,-2,1.575,-1.545,0.677,1.226,-0.704,-1.088,0.007,-1.807" left  (style: 10 = -2. 0., 8 = -1. 0., 2 = 0. 2.)
    //"-0.133,-2,0.513,-0.866,1.868,-1.638,-1.38,0.521,-0.153,-0.874" down  (style: 7 = 1. -1., 8 = 1. -1.)
    //"1.8297801, -0.4157947, -1.0119464, 1.4034479, 2.1065679, 1.3560127, 0.82890403, -0.5186312, -0.1627591, 1.1094365"  right (style: 10 = -1.2 2., 8 = -1. 0., 1 = 1.5, 2)
    //"-1.223151,0.59306544,-0.99677056,1.2815813,1.6780939,-1.026062,2.2234292,0.16185719,-1.8529218,-0.88207924"  right2 (style: 3 = -2. -1.)
    //"1.244,-1.975,-1.139,-0.359,1.573,1.741,-0.355,-0.058,0.446,-0.474"  up (style: 8 = -2. 0.)
    setSliders()
    setTimeout(tf.tidy(()=>{
        decode([Array.from({length: 10}, () => ((Math.random()-0.5)*2), 0, 0)])
    }), 1)
}
window.addEventListener('mousemove', (e) => { 
    mx = (-e.clientX + window.innerWidth/2)/window.innerWidth;
    my = (-e.clientY + window.innerHeight/2)/window.innerHeight; 
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
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+0] = (arr[pixY][pixX][0] + 1.9) * 65
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+1] = (arr[pixY][pixX][1] + 1.9) * 65
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+2] = (arr[pixY][pixX][2] + 1.9) * 65
                    imgData.data[(((y+oy)*scale * size) + x + ox)*4+3] = 255
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0)
    var overrides = {
        0 : 3,
        2 : -my * 6,
        3 : -mx * 6,
        7 : -3
    }
    ctx.setTransform(1,0,0,1,0,0);
    arr = sliders.map(elem => parseFloat(elem.value))
    //arr = //[-0.06266112, -0.22826499, 0.24308869, 0.92911506, 1.3716903, -0.59417135, -0.7281226, 2.5582855, -0.86736846, 1.3545672]
    for (const key of Object.keys(overrides)) {
        //arr[key] = overrides[key];
    }
    setTimeout(tf.tidy(()=>{
        decode([arr])
    }), 100)
}

async function decode(dense, x, y) {
    var rgb = await decoder.predict(tf.tensor(dense)).array();
    drawFromRGB_imdata(rgb, x, y);
}