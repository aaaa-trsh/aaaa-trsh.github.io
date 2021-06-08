const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "bg: war";
infoText.innerHTML = "template, going to become a marching cubes destrucatable env";

const bgColor = "#0a0a0a";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var cellSize = -1;
var curRow = 0;
var map = [];
var time = 0;

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    noise.seed(Math.random());

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    update();
};
init();

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cellSize = 200000/(window.innerWidth);
    scaleMap(Math.ceil(canvas.width/cellSize), Math.ceil(canvas.height/cellSize));
}

function scaleMap(newSizeX, newSizeY) {
    map = Array.from(Array(newSizeY), () => new Array(newSizeX))
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function draw() {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    for (var y = 0; y < map.length; y++)
    {
        for (var x = 0; x < map[y].length; x++)
        {
            var level = (noise.simplex3(x/20, y/20, time)+1/2)*256;
            ctx.fillStyle = `rgb(${level}, ${level}, ${level})`;
            ctx.fillRect(x*cellSize, y*cellSize, cellSize-1, cellSize-1);
        }
    }
}
function update() {
    time += 0.01
    draw();
    window.requestAnimationFrame(update);
}