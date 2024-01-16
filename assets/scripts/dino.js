dinoContainer = document.getElementById('dino-container');
bgElement = document.getElementById('bg');

const images = [
    { src: '/assets/imgs/dino/dino_idle.gif', name: 'dino_idle' }, 
    { src: '/assets/imgs/dino/dino_run_bad.gif', name: 'dino_run_bad' }, 
    { src: '/assets/imgs/dino/dino_die_up.png', name: 'dino_die_up' }, 
    { src: '/assets/imgs/dino/dino_die_dwn.png', name: 'dino_die_dwn' }, 
    { src: '/assets/imgs/dino/dino_die.gif', name: 'dino_die' },
    { src: '/assets/imgs/dino/dino_up.gif', name: 'dino_up' },
    { src: '/assets/imgs/dino/dino_jump.png', name: 'dino_jump' },
];
const preloadedImages = {};
images.forEach(img => {
    const newImage = new Image();
    newImage.src = img.src;
    preloadedImages[img.name] = newImage;
});

dinoContainer.style.width = window.innerWidth + "px";
dinoContainer.style.height = window.innerHeight + "px";

let mouse = {
    x: 500,
    y: 200,
    down: false,
    ts: 0
}

const average = array => array.reduce((a, b) => a + b) / array.length;

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}

function inverseLerp(v0, v1, v) {
    return (v - v0) / (v1 - v0);
}

function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
}

function deadzone(v, deadzone) {
    return Math.sign(v) * Math.max(Math.abs(v) - deadzone, 0);
}

class IdleState {
    constructor() {
        this.sprite = preloadedImages['dino_idle'].src;
    }

    update(dino) {
        let dX = (mouse.x - dino.x);
        let dY = (mouse.y - dino.y);
        dino.vX = lerp(dino.vX, 0, 0.1);
        dino.vY = lerp(dino.vY, 0, 0.1);
        dino.faceCursor();

        if (Math.abs(dX) > 80 || Math.abs(dY) > 80) {
            return new RunState();
        }
    }
}

class RunState {
    constructor() {
        this.sprite = preloadedImages['dino_run_bad'].src;
        this.pX = 0;
        this.pY = 0;
        this.accleration = 0.07;
    }

    update(dino) {
        let dX = (mouse.x - dino.x);
        let dY = (mouse.y - dino.y);
        let oX = clamp(deadzone(dX, 70), -10, 10)/10;
        let oY = clamp(deadzone(dY, 70), -10, 10)/10;

        // make it ramp up and down
        if (Math.abs(dX) > 50) {
            this.pX = clamp(this.pX + this.accleration * oX, -1, 1);
        } else {
            this.pX = clamp(this.pX - this.accleration * oX, -1, 1);
        }

        if (Math.abs(dY) > 50) {
            this.pY = clamp(this.pY + this.accleration * oY, -1, 1);
        } else {
            this.pY = clamp(this.pY - this.accleration * oY, -1, 1);
        }

        // console.log(this.pX, this.pY);
        dino.vX = lerp(dino.vX, this.pX * 4, 0.4);
        dino.vY = lerp(dino.vY, this.pY * 4, 0.4);
        dino.faceCursor();

        if (Math.abs(dX) < 70 && Math.abs(dY) < 70) {
            return new IdleState();
        }
    }
}

class AirState {
    constructor() {
        this.upSprite = preloadedImages['dino_die_up'].src;
        this.downSprite = preloadedImages['dino_die_dwn'].src;
        this.sprite = this.upSprite;
        this.gravity = 1.6;
        this.bounces = 3;
        this.timeDown = 0;
    }

    update(dino) {
        dino.vz += this.gravity;
        
        if (dino.z > 0) {
            dino.z = 0;
            dino.vz = -dino.vz * .4;
            dino.vY = dino.vY * .4;
            dino.vX = dino.vX * .4;
            this.bounces--;
            if (this.bounces == 0) {
                this.timeDown = 0;
            }
        }

        if (
            dino.x + dino.getXOffset() < 30
        ) {
            dino.vX = -dino.vX * .7;
            dino.x = 30 - dino.getXOffset();
        }

        if (
            dino.y + dino.z + dino.getYOffset() < 30
        ) {
            dino.vY = -dino.vY * .7;
            dino.y = 30 - dino.z - dino.getYOffset();
        }

        if (dino.vz < 15) {
            this.sprite = this.upSprite;
        } else {
            this.sprite = this.downSprite;
        }
        
        if (this.bounces <= 0) {
            dino.vz = 0;
            dino.z = 0;
            dino.vX = lerp(dino.vX, 0, 0.1);
            dino.vY = lerp(dino.vY, 0, 0.1);
            // dino.element.style.opacity = 0.3;
            // dino.shadowElement.style.display = "none";
            return new GetUpState();
        }
        
        // if (this.timeDown > 1.5) {
        //     dino.element.style.opacity = 1;
        //     dino.shadowElement.style.display = "block";
        //     return new GetUpState();
        // }
        this.timeDown += 0.02; 
    }
}

class JumpState {
    constructor() {
        this.sprite = preloadedImages['dino_jump'].src;
        this.gravity = 1.6;
        this.bounces = 3;
        this.timeDown = 0;
        this.runState = new RunState();
        this.runState.pX = null;
        this.runState.pY = null;
    }

    update(dino) {
        dino.vz += this.gravity;
        
        if (this.runState.pX == null || this.runState.pY == null) {
            this.runState.pX = dino.vX;
            this.runState.pY = dino.vY;
        }

        this.runState.update(dino);
        if (dino.z > 0) {
            dino.z = 0;
            dino.vz = 0;

            return this.runState;
        }

    }
}

class DieState {
    constructor() {
        this.sprite = preloadedImages['dino_die'].src;
        this.timeDown = 0;
    }

    update(dino) {
        dino.vX = lerp(dino.vX, 0, 0.1);
        dino.vY = lerp(dino.vY, 0, 0.1);

        if (dino.vX < 1 && dino.vY < 1 && dino.vz < 1) {
            dino.vX = 0;
            dino.vY = 0;
            dino.vz = 0;
            
            this.timeDown += 0.05;
        }

        if (this.timeDown > 1) {
            this.sprite = preloadedImages['dino_die_up'].src;
        }

        if (this.timeDown > 4) {
            return new GetUpState();
        }
    }
}

class GetUpState {
    constructor() {
        this.sprite = preloadedImages['dino_up'].src;
        this.timeRecovering = 0;
    }

    update(dino) {
        this.timeRecovering += 0.05;

        if (dino.vX < 1 && dino.vY < 1 && dino.vz < 1) {
            dino.vX = 0;
            dino.vY = 0;
            dino.vz = 0;
        } else {
            dino.vX = lerp(dino.vX, 0, 0.1);
            dino.vY = lerp(dino.vY, 0, 0.1);
            dino.vz = lerp(dino.vz, 0, 0.1);
        }

        if (this.timeRecovering > 1) {
            return new IdleState();
        }
    }
}

class Dino {
    constructor(id) {
        this.x = 100;
        this.y = 100;
        this.z = 0;
        this.vX = 0;
        this.vY = 0;
        this.vz = 0;
        this.state = new IdleState();
        this.element = document.getElementById('dino');
        this.shadowElement = document.getElementById('dino-shadow');
        this.pointerElement = document.getElementById('dino-pointer');
        window.requestAnimationFrame(() => this.loop());
    }

    loop() {
        this.element.style.backgroundImage = `url(\'${this.state.sprite}\')`;

        const dinoDist = Math.sqrt((mouse.x - dino.x) ** 2 + (mouse.y - dino.y + 30) ** 2);
        if (dinoDist < 30) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }

        this.x += this.vX;
        this.y += this.vY;
        this.z += this.vz;
        this.element.style.left = this.x - 30 + "px";
        this.element.style.top = this.y + this.z - 60 + "px";

        this.shadowElement.style.left = this.x - 20 + "px";
        this.shadowElement.style.top = this.y - 24 + "px";

        this.shadowElement.style.transform = `scaleX(${clamp(Math.abs(this.z) / 100, 1, 2)})`;
        this.shadowElement.style.opacity = 1 - clamp(Math.abs(this.z) / 100, 0.8, 0.95);

        this.state = this.state.update(this) || this.state;
        window.requestAnimationFrame(() => this.loop());
    }

    getXOffset() {
        return this.x - 30;
    }
    
    getYOffset() {
        return this.y + this.z - 60;
    }

    faceCursor() {
        this.element.style.transform = `scaleX(${Math.sign(mouse.x - this.x) || 1})`;
    }

    throw() {
        if (this.state instanceof AirState || this.state instanceof DieState) {
            return;
        }

        this.state = new AirState();
        this.vz = -20;
        let planarForce = 15 + Math.random() * 10;
        let vector = {
            x: (Math.random()-.5),
            y: (Math.random()-.7)
        }

        let vectorLength = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        vector.x /= vectorLength;
        vector.y /= vectorLength;

        this.vX = vector.x * planarForce;
        this.vY = vector.y * planarForce;
    }

    jump() {
        if (this.state instanceof AirState || this.state instanceof DieState || this.state instanceof JumpState) {
            return;
        }

        this.state = new JumpState();
        this.vz = -20;
    }

    die() {
        if (this.state instanceof DieState) {
            return;
        }

        this.state = new DieState();
    }
}

const dino = new Dino();

window.addEventListener('mouseup', () => {
    mouse.down = false;

    const dinoDist = Math.sqrt((mouse.x - dino.x) ** 2 + (mouse.y - dino.y + 30) ** 2);
    if (dinoDist < 30) {
        dino.throw();
    } else {
        dino.jump();
    }
});

window.addEventListener('mousedown', () => {
    mouse.down = true;
});