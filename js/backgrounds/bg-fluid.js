
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
let birds = [];
let time = 0;
resize()
window.addEventListener('resize', resize);
function resize() {
    canvas.width = Math.ceil(canvas.clientWidth/2);
    canvas.height = Math.ceil(canvas.clientHeight/2);
    birds = []
    for (let i = 0; i < 50; i++) {
        birds.push([canvas.width * Math.random(), canvas.height * Math.random(), (Math.random() * 4 * Math.PI) - 2 * Math.PI, Math.random() + .5]);
    }
}

// track mouse
let mouse = [0, 0];
window.addEventListener('mousemove', (e) => {
    mouse[0] = e.clientX;
    mouse[1] = e.clientY - document.getElementsByClassName('navbar')[0].clientHeight;
});

function lerp(a, b, t) {
    return a + (b - a) * t;
}

update();
function update() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = '#0002';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;

    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < birds.length; i++) {
        // get all birds near 
        let r1 = [0, 0];
        let r2 = 0;
        let r3 = [0, 0];
        let n = 0;
        for (let j = 0; j < birds.length; j++) {
            if (i != j) {

                let dist = Math.sqrt(Math.pow(birds[i][0] - birds[j][0], 2) + Math.pow(birds[i][1] - birds[j][1], 2));
                if (dist < 100) {
                    r1[0] -= (birds[j][0] - birds[i][0]);
                    r1[1] -= (birds[j][1] - birds[i][1]);
                    r3[0] += birds[j][0];
                    r3[1] += birds[j][1];
                    r2 += birds[j][2];
                    n += 1;
                }
            }
        }
        if (n > 0) {
            r1[0] /= n;
            r1[1] /= n;
            r3[0] /= n;
            r3[1] /= n;
            r2 /= n;

            birds[i][2] = lerp(birds[i][2], Math.atan2(r1[1], r1[0]), 0.01);
            birds[i][2] = lerp(birds[i][2], r2, 0.01);
            birds[i][2] = lerp(birds[i][2], Math.atan2(r3[1], r3[0]), 0.03);
        }
        // steer away from mouse
        let dist = Math.sqrt(Math.pow(birds[i][0] - mouse[0], 2) + Math.pow(birds[i][1] - mouse[1], 2));
        if (dist < 60) {
            birds[i][2] = lerp(birds[i][2], Math.atan2(birds[i][1] - mouse[1], birds[i][0] - mouse[0]), 0.01);
        }

        birds[i][0] += Math.cos(birds[i][2]) * birds[i][3];
        birds[i][1] += Math.sin(birds[i][2]) * birds[i][3];

        

        // draw triangle
        ctx.beginPath();
        ctx.moveTo(birds[i][0] + Math.cos(birds[i][2] + Math.PI / 4) * -5 * birds[i][3], birds[i][1] + Math.sin(birds[i][2] + Math.PI / 4) * -5 * birds[i][3]);
        ctx.lineTo(birds[i][0], birds[i][1]);
        ctx.lineTo(birds[i][0] + Math.cos(birds[i][2] - Math.PI / 4) * -5 * birds[i][3], birds[i][1] + Math.sin(birds[i][2] - Math.PI / 4) * -5 * birds[i][3]);
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        ctx.stroke();


        ctx.closePath();
        // ctx.fillStyle = '#fff';

        // wrap around screen
        if (birds[i][0] < -4) {
            birds[i][0] = canvas.width;
            birds[i][2] = Math.random() * 4 * Math.PI - 2 * Math.PI;
        }
        if (birds[i][0] > canvas.width+4) {
            birds[i][0] = 0;
            birds[i][2] = Math.random() * 4 * Math.PI - 2 * Math.PI;
        }
        if (birds[i][1] < -4) {
            birds[i][1] = canvas.height;
            birds[i][2] = Math.random() * 4 * Math.PI - 2 * Math.PI;
        }
        if (birds[i][1] > canvas.height+4) {
            birds[i][1] = 0;
            birds[i][2] = Math.random() * 4 * Math.PI - 2 * Math.PI;
        }
    }
    console.log(birds[0][1])

    window.requestAnimationFrame(update);
}