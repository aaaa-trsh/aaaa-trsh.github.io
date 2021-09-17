const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "flow";
infoText.innerHTML = "a colored noise field - and your cursor is a particle attractor!";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.style.filter = "blur(2px) brightness(3)"
const G = 7e-11;
resizeCanvas();
let planets = [
];

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for(let i = 0; i < 10; i++) {
        let rad = Math.random() * 30;
    
        // let angle = Math.random()*2*Math.PI;
        // let x = (Math.cos(angle) * canvas.height/4) + canvas.width/2;
        // let y = (Math.sin(angle) * canvas.height/4) + canvas.height/2;
    
        // // velocity tangent to circle
        // let vx = Math.cos(angle + Math.PI * 1.2) * 10;
        // let vy = Math.sin(angle + Math.PI * 1.2) * 10;
    
        // random point along walls
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
    
        let wallSpacing = rad * 1.1;
    
        if (Math.random() > 0.5) {
            if (Math.random() > 0.5) { y = -wallSpacing; }
            else { y = canvas.height + wallSpacing; }
        } else
        {
            if (Math.random() > 0.5) { x = -wallSpacing; }
            else { x = canvas.width + wallSpacing; }
        }
    
        planets.push({
            radius: rad,
            mass: rad*200000+1000000,
            x: x,
            y: y,
            vx: (Math.random() * 40) - 20,
            vy: (Math.random() * 40) - 20,
            ax: 0,
            ay: 0,
            color: `hsl(${(i / 50) * 70}, 100%, 60%)`,
        });
    }
    // window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => { mx = -e.clientX + canvas.width/2; my = -e.clientY + canvas.height/2; });
    // ctx.filter = 'blur(4px)';
    update();
};

init();


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawCircle(a, r) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}

function update() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0009"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    for (let i = 0; i < planets.length; i++) {
        let planet = planets[i];
        ctx.fillStyle = planet.color;
        ctx.globalAlpha = .1;

        drawCircle(planet, planet.radius * 0.8);
        ctx.fill();
        ctx.globalAlpha = .1;
        drawCircle(planet, planet.radius * 0.9);
        drawCircle(planet, planet.radius * 1);

        ctx.fillStyle = "white"
        drawCircle(planet, planet.radius * .4);
        // drawCircle(planet, planet.radius * .5);
        ctx.globalAlpha = 1;
        //gravitate
        planet.ax = 0;
        planet.ay = 0;
        for (let j = 0; j < planets.length; j++) {
            if (i != j) {
                if (Math.sqrt(Math.pow(planet.x - planets[j].x, 2) + Math.pow(planet.y - planets[j].y, 2)) > planet.radius + planets[j].radius) {
                    let otherPlanet = planets[j];
                    let dx = planet.x - otherPlanet.x;
                    let dy = planet.y - otherPlanet.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    let force = (G * planet.mass * otherPlanet.mass) / (dist * dist);
                    let angle = Math.atan2(dy, dx);
                    planet.ax -= Math.cos(angle) * force;
                    planet.ay -= Math.sin(angle) * force;
                }
                // else {
                //     planet.ax = 0;
                //     planet.ay = 0;
                //     // planet.vx = 0;
                //     // planet.vy = 0;
                // }
            }
        }
    }

    for (let i = 0; i < planets.length; i++) {
        let planet = planets[i];
        //move
        planet.vx += planet.ax;
        planet.vy += planet.ay;
        planet.x += planet.vx;
        planet.y += planet.vy;

        // delete if out of bounds
        if (planet.x < -planet.radius * 1.2 || 
            planet.x > canvas.width + planet.radius * 1.2 || 
            planet.y < -planet.radius * 1.2 || 
            planet.y > canvas.height + planet.radius * 1.2) {
            planets.splice(i, 1);
            let rad = Math.random() * 30;
        
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
        
            let wallSpacing = rad * 1.1;
        
            if (Math.random() > 0.5) {
                if (Math.random() > 0.5) { y = -wallSpacing; }
                else { y = canvas.height + wallSpacing; }
            } else
            {
                if (Math.random() > 0.5) { x = -wallSpacing; }
                else { x = canvas.width + wallSpacing; }
            }
        
            planets.push({
                radius: rad,
                mass: rad*200000+10000000,
                x: x,
                y: y,
                vx: (Math.random() * 20) - 10,
                vy: (Math.random() * 20) - 10,
                ax: 0,
                ay: 0,
                color: `hsl(${(i / 50) * 90}, 100%, 60%)`,
            });
        }
    }
    window.requestAnimationFrame(update);
}