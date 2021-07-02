const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "flow";
infoText.innerHTML = "a colored noise field - and your cursor is a particle repulsor!";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var cellSize = -1;
var time = 0;
var mx = 0;
var my = 0;
var ma = 0;
var particles = [];
var cellSpeed = 5;
var cellWidth = 4;
var noiseSize = 200;

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function init() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => { mx = -e.clientX + canvas.width/2; my = -e.clientY + canvas.height/2; });
    resizeCanvas();

    noise.seed(Math.random());
    var count = 2000;
    if (window.mobileCheck()) {
        count = 500;
        cellSpeed = 4;
        cellWidth = 6;
    }
    for (var i = 0; i < count; i++) { particles.push([Math.round(Math.random() * canvas.width), Math.round(Math.random() * canvas.height)]); }

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawPoint(x, y, a, w, s) { 
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(-(s/2), -(s/2), w, s)
    
    ctx.globalAlpha = .005
    var bloomSize = Math.log(Math.random()) * 20
    ctx.fillRect(-(bloomSize/2), -(bloomSize/2), bloomSize, bloomSize)
    ctx.globalAlpha = 1
    ctx.resetTransform();
}

function mouseToDirection(n) {  
    return ((n * 2)-((2/2)%2)) * Math.PI
}

function xyComponents(angle, flip=false) { return !flip ? [Math.cos(angle), Math.sin(angle)] : [-Math.cos(angle), -Math.sin(angle)] }
function drawParticle(x, y, i) {
    var noiseValue = (((noise.perlin3((x/cellSize)/noiseSize, (y/cellSize)/noiseSize, time)+1))/2)
    ctx.fillStyle = `hsl(${(noiseValue*30) + (Math.sin(time)-1)*20}, 100%, 60%, .4)`;

    var noiseAngle =  xyComponents(mouseToDirection(noiseValue))
    var attractor = xyComponents(Math.atan2(((-my + canvas.height/2)-y), ((-mx + canvas.width/2)-x)), true)
    var mix = clamp(Math.sqrt(((-mx+ canvas.width/2)-x)**2 + ((-my+ canvas.height/2)-y)**2)/(Math.max(canvas.height, canvas.width)/7), 0, 2)
    var addX = lerp(attractor[0], noiseAngle[0], clamp(mix, .3, 2))*cellSpeed //*noiseValue//*(clamp(mix, .3, 2))
    var addY = lerp(attractor[1], noiseAngle[1], clamp(mix, .3, 2))*cellSpeed //*noiseValue//*(clamp(mix, .3, 2))
    drawPoint(x, y, Math.atan2(particles[i][1]-(particles[i][1]+addY), particles[i][0]-(particles[i][0]+addX)), Math.hypot(addX, addY), cellWidth);
    particles[i] = [x + addX, y + addY]
}
function update() {
    time += 0.004
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = .05
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1
    
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < particles.length; i++) {
        drawParticle(particles[i][0], particles[i][1], i);
        if ((particles[i][0] > canvas.width || particles[i][0] < 0 || 
            particles[i][1] > canvas.height || particles[i][1] < 0) || Math.random() > 0.999) 
        {
            //particles[i] = [(-mx + canvas.width/2)+((Math.random()-0.5)*(Math.max(canvas.height, canvas.width)/4)), (-my + canvas.height/2)+((Math.random()-0.5)*(Math.max(canvas.height, canvas.width)/4))]//[Math.round(Math.random() * canvas.width), Math.round(Math.random() * canvas.height)];
            particles[i] = [Math.round(Math.random() * canvas.width), Math.round(Math.random() * canvas.height)];
        }
    }
    setTimeout(update)
}