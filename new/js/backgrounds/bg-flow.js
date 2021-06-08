const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "flow";
infoText.innerHTML = "a colored noise field";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var cellSize = -1;
var time = 0;
var mx = 0;
var my = 0;
var ma = 0;
var particles = [];

function init() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => { mx = -e.clientX + window.innerWidth/2; my = -e.clientY + window.innerHeight/2; });
    resizeCanvas();

    noise.seed(Math.random());
    for (var i = 0; i < 1000; i++) { particles.push([Math.round(Math.random() * window.innerWidth), Math.round(Math.random() * window.innerHeight)]); }

    update();
};
init();

function lerp(start, end, amt){
    return (1-amt)*start+amt*end
}

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cellSize = 200000/(window.innerWidth);
}

function drawPoint(x, y, a, s) { 
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(-(s/2), -(s/2), 7, s)
    
    ctx.globalAlpha = .005
    var bloomSize = Math.log(Math.random()) * 20
    ctx.fillRect(-(bloomSize/2), -(bloomSize/2), bloomSize, bloomSize)
    ctx.globalAlpha = 1
    ctx.resetTransform();

}

function mouseToDirection(n) {  
    return ((n * 2)-((time/2)%2)) * Math.PI
}

function xyComponents(angle, flip=false) { return !flip ? [Math.cos(angle), Math.sin(angle)] : [-Math.cos(angle), -Math.sin(angle)] }
function drawParticle(x, y, i) {
    var noiseValue = (((noise.perlin3((x/cellSize)/1.5, (y/cellSize)/1.5, time)+1))/2)
    ctx.fillStyle = `hsl(${(noiseValue*30)}, 100%, 60%, .4)`;

    var noiseAngle =  xyComponents(mouseToDirection(noiseValue))
    var attractor = xyComponents(Math.atan2(((-my+ window.innerHeight/2)-y), ((-mx+ window.innerWidth/2)-x)), true)
    var mix = clamp(Math.sqrt(((-mx+ window.innerWidth/2)-x)**2 + ((-my+ window.innerHeight/2)-y)**2)/200, 0, 1)
    var addX = lerp(attractor[0], noiseAngle[0], mix)*7
    var addY = lerp(attractor[1], noiseAngle[1], mix)*7
    drawPoint(x, y, Math.atan2(particles[i][1]-(particles[i][1]+addY), particles[i][0]-(particles[i][0]+addX)), 3);
    particles[i] = [x + addX, y + addY]
}
function update() {
    time += 0.002
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = .05
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = 1
    
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < particles.length; i++) {
        drawParticle(particles[i][0], particles[i][1], i);
        if (particles[i][0] > window.innerWidth || particles[i][0] < 0 || 
            particles[i][1] > window.innerHeight || particles[i][1] < 0) 
        {
            particles[i] = [Math.round(Math.random() * window.innerWidth), Math.round(Math.random() * window.innerHeight)];
        }
    }
    setTimeout(update)
}