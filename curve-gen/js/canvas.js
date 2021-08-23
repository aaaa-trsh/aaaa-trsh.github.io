const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let mx = 0;
let my = 0;
let keysDown = {};
let clicking = false;

resizeCanvas();
window.onkeyup = function(e) {
    keysDown[e.key] = false;
}
window.onkeydown = function(e) {
    keysDown[e.key] = true;
}
window.addEventListener('resize', resizeCanvas);
// on click
canvas.addEventListener('mousedown', (e) => {
    clicking = true;
    currentTool.toolObj.click(e);
});
canvas.addEventListener('mouseup', (e) => {
    clicking = false;
    currentTool.toolObj.unclick(e);
});
//on move
canvas.addEventListener('mousemove', (e) => {
    let rect = e.target.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top; 
    currentTool.toolObj.move(e);
});

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function drawLine(a, b) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.closePath();
} 

function drawTri(p, width, height, angle) {
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(height, 0);
    ctx.lineTo(0, width);
    ctx.lineTo(-height, 0);
    ctx.fill();
    ctx.closePath();
    ctx.resetTransform();
}

function drawCircle(a, r) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
}

update();
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentTool.toolObj.update();
    window.requestAnimationFrame(update);
}