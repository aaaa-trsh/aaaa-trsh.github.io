var points = [];
var mx = 0;
var my = 0;
var constantRotation = 0;
const keyByValue = (dict, value) => Object.keys(dict).find(key => dict[key] === value);
const minRad = 100;
const modes = Object.freeze({
    "default":{
        "name":"default",
        "point":null,
        "fillet":false,
        "transform":false,
    },
    "ShiftLeft":{
        "name":"create",
        "exit":"keyUp"
    }
})
var curMode = modes["default"]
var createModeKey = "ShiftLeft";
var pressedKeys = {};
var keyDown = false;

window.onkeyup = function(e) {
    pressedKeys[e.code] = false;
    if (curMode.exit == "keyUp")
        curMode = modes["default"]
    keyDown = false;
}
window.onkeydown = function(e) {
    pressedKeys[e.code] = true;
    
    if (!keyDown) {
        keyDown = true
        if (curMode.exit == "toggle" && keyByValue(modes, curMode) == e.code) {
            curMode = modes["default"]
        } else {
            if (e.code in modes) {
                curMode = modes[e.code]
            }
        }
    }
}

window.onload = function() {
    ctx.fillStyle = "#1d2528"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    update()
};

window.addEventListener('mousemove', e => {
    mx = e.offsetX;
    my = e.offsetY;
});

window.addEventListener('mousedown', e => {
    if (curMode.name == "create" && e.button == 0) {
        var point = new Point(points.length, Math.round(mx), Math.round(my))

        if (points.length > 0) {
            points[points.length-1].neighbors[1] = point;
            point.neighbors[0] = points[points.length-1];
        }

        points.push(point);
    }
    else if (curMode.name == "default") {
        var nearest = Point.closestToMouse(mx, my)
        curMode.point = points[nearest[0]];

        if (nearest[1] < 200) {
            if (e.button == 2)
                curMode.fillet = true;
            else if (e.button == 0)
                curMode.transform = true;
        }
    }
});
window.addEventListener('mouseup', e => {
    if (curMode.name == "default") {
        curMode.point = null;
        curMode.fillet = false;
        curMode.transform = false;
    }
});

function normal(p1, p2) {
    var tangent = [p1.x - p2.x, p1.y - p2.y]
    var normal = [-tangent[1], tangent[0]]
    var length = Math.hypot(normal[0], normal[1]);
    normal[0] /= length;
    normal[1] /= length;
    return normal
}
function angle(x1, y1, x2, y2, inv=false) {
    var retval = null;
    if (!inv) { retval = Math.atan2(y1 - y2, x1 - x2); }
    else { retval = Math.atan2(y2 - y1, x2 - x1); }
    return retval
}
function drawLine(x1, y1, x2, y2, offsetStart=0, offsetEnd=0, theta=null) {
    if (Math.abs(offsetStart) > 0 || Math.abs(offsetStart) > 0)
    {
        if (theta == null) { theta = angle(x1, y1, x2, y2) }
        x1 += Math.cos(theta) * offsetStart
        y1 += Math.sin(theta) * offsetStart
        x2 += Math.cos(theta) * offsetEnd
        y2 += Math.sin(theta) * offsetEnd
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    return [x1, y1, x2, y2]
}
function drawTri(cx, cy, width, height, angle) {
    ctx.translate(cx, cy);
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
function midpoint(x1, y1, x2, y2) { return [(x1 + x2)/2, (y1 + y2)/2] }

function intersectLineSegments(x1, y1, x2, y2, x3, y3, x4, y4) {
    var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
    //var u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
    return [x1 + (t * (x2 - x1)), y1 + (t * (y2 - y1))]
}

function isBetween(x1, x2, x2, y2, tx, ty) {
    var cross = (ty - y1) * (x2 - x1) - (tx - x1) * (y2 - y1);
    if (Math.abs(cross) > 0.1) { return false; }

    var dot = (tx - x1) * (x2 - x1) + (ty - y1)*(y2 - y1);
    if (dot > 0) { return false; }

    var ba2 = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
    if (dot > ba2) { return false; }

    return true;
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
}
class Point {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.hover = false;
        this.neighbors = [null, null];
        this.offset = 0
        this.r = minRad/2
        this.invalidRadius = -1;
    }

    static closestToMouse(x, y) {
        let distToMouse = [];
        for (var i = 0; i < points.length; i++) {
            points[i].hover = false;
            distToMouse.push(parseInt(Math.hypot(x-points[i].x, y-points[i].y)));
        }
        return [distToMouse.indexOf(Math.min(...distToMouse)), Math.min(...distToMouse)];
    }

    distanceFromPoint(x, y) {
        return Math.sqrt((x - this.x)**2 + (y - this.y)**2)
    }

    drawFillet(backSegNormal, frontSegNormal) {
        var flip = math.dot(frontSegNormal, [this.neighbors[0].x - this.x, this.neighbors[0].y - this.y]) < 0 ? -1 : 1

        var intersection = intersectLineSegments(
            this.x + (this.r * backSegNormal[0] * flip), this.y + (this.r * backSegNormal[1] * flip), this.neighbors[0].x + (this.r * backSegNormal[0] * flip), this.neighbors[0].y + (this.r * backSegNormal[1] * flip),
            this.x + (this.r * frontSegNormal[0] * flip), this.y + (this.r * frontSegNormal[1] * flip), this.neighbors[1].x + (this.r * frontSegNormal[0] * flip), this.neighbors[1].y + (this.r * frontSegNormal[1] * flip)
        )

        this.offset = Math.sqrt(this.distanceFromPoint(intersection[0], intersection[1])**2 - this.r**2);
        var style = ctx.strokeStyle
        var lw = ctx.lineWidth
        ctx.strokeStyle = "darkslategray";
        ctx.setLineDash([5, 2]);
        if (flip > 0) {
            drawLine(intersection[0]-(this.r * backSegNormal[0]), intersection[1]-(this.r * backSegNormal[1]), this.x, this.y)
            drawLine(this.x, this.y, intersection[0]-(this.r * frontSegNormal[0]), intersection[1]-(this.r * frontSegNormal[1]))
        }
        else {
            drawLine(intersection[0]+(this.r * backSegNormal[0]), intersection[1]+(this.r * backSegNormal[1]), this.x, this.y)
            drawLine(this.x, this.y, intersection[0]+(this.r * frontSegNormal[0]), intersection[1]+(this.r * frontSegNormal[1]))
        }
        ctx.strokeStyle = style;
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.strokeStyle = "#7cd5f1"

        if (flip > 0) {
            ctx.globalAlpha = 0.1
            ctx.lineWidth = minRad
            ctx.beginPath();
            ctx.arc(intersection[0], intersection[1], this.r, 
                angle(intersection[0], intersection[1], intersection[0]-(this.r * backSegNormal[0]), intersection[1]-(this.r * backSegNormal[1]), true),
                angle(intersection[0], intersection[1], intersection[0]-(this.r * frontSegNormal[0]), intersection[1]-(this.r * frontSegNormal[1]), true)
            );
            ctx.stroke();
            ctx.lineWidth = lw
            ctx.globalAlpha = 1
            ctx.strokeStyle = style
            ctx.stroke();
            ctx.closePath();
            
        } else {
            ctx.globalAlpha = 0.1
            ctx.lineWidth = minRad

            ctx.beginPath();
            ctx.arc(intersection[0], intersection[1], this.r, 
                angle(intersection[0], intersection[1], intersection[0]-(this.r * frontSegNormal[0]), intersection[1]-(this.r * frontSegNormal[1])),
                angle(intersection[0], intersection[1], intersection[0]-(this.r * backSegNormal[0]), intersection[1]-(this.r * backSegNormal[1]))
            );
            ctx.stroke();
            ctx.lineWidth = lw
            ctx.globalAlpha = 1
            ctx.strokeStyle = style

            ctx.stroke();
            ctx.closePath();
        }
        ctx.fillRect(intersection[0]-2, intersection[1]-2, 2, 2)
    }

    draw() {
        ctx.fillStyle = "#ff6d73";
        ctx.strokeStyle = "white";
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.PI/4);
        ctx.fillRect(-5, -5, 9, 9);
        
        if (this.hover) {
            ctx.strokeStyle = "#fff145";
            ctx.rotate(constantRotation);
            ctx.lineWidth = 2;
            ctx.strokeRect(-10, -10, 20, 20);
            ctx.lineWidth = 1;
            ctx.resetTransform();
            ctx.strokeStyle = "white";
        }
        ctx.resetTransform();
    }

    update() {
        if (this.neighbors[0] != null && this.neighbors[1] != null) {
            var backSegNormal = normal(this, this.neighbors[0])
            var frontSegNormal = normal(this.neighbors[1], this)
            var minSegLength = Math.min(
                this.distanceFromPoint(this.neighbors[0].x, this.neighbors[0].y)-this.neighbors[0].offset, 
                this.distanceFromPoint(this.neighbors[1].x, this.neighbors[1].y)-this.neighbors[1].offset
            )
            if (curMode.name == "default" && curMode.fillet == true && curMode.point == this) {
                if (this.offset - minSegLength < 0) {
                    this.r = this.distanceFromPoint(mx, my)+minRad/2
                }
            }
            var i = 0
            while (this.offset - minSegLength > 0) {
                this.r = Math.max(this.r - 1, minRad/2)
                var flip = math.dot(frontSegNormal, [this.neighbors[0].x - this.x, this.neighbors[0].y - this.y]) < 0 ? -1 : 1

                var intersection = intersectLineSegments(
                    this.x + (this.r * backSegNormal[0] * flip), this.y + (this.r * backSegNormal[1] * flip), this.neighbors[0].x + (this.r * backSegNormal[0] * flip), this.neighbors[0].y + (this.r * backSegNormal[1] * flip),
                    this.x + (this.r * frontSegNormal[0] * flip), this.y + (this.r * frontSegNormal[1] * flip), this.neighbors[1].x + (this.r * frontSegNormal[0] * flip), this.neighbors[1].y + (this.r * frontSegNormal[1] * flip)
                )

                this.offset = Math.sqrt(this.distanceFromPoint(intersection[0], intersection[1])**2 - this.r**2);
                i += 1;
                if (i > 1000) { break; }
            }
            if (i > 0){ ctx.strokeStyle = "red"; ctx.lineWidth = 3; }
            this.drawFillet(backSegNormal, frontSegNormal);
            if (i > 0){ ctx.strokeStyle = "white"; ctx.lineWidth = 1; }

            ctx.globalAlpha = 0.1
            ctx.lineWidth = minRad
            ctx.strokeStyle = "#7cd5f1"
            drawLine(this.x, this.y, this.neighbors[0].x, this.neighbors[0].y, -this.offset, this.neighbors[0].offset);
            ctx.lineWidth = 1
            ctx.globalAlpha = 1
            ctx.strokeStyle = "white"
            drawLine(this.x, this.y, this.neighbors[0].x, this.neighbors[0].y, -this.offset, this.neighbors[0].offset);
        }
        if (this.neighbors[1] != null && this.neighbors[1].neighbors[1] == null) {
            ctx.globalAlpha = 0.1
            ctx.lineWidth = minRad
            ctx.strokeStyle = "#7cd5f1"
            drawLine(this.x, this.y, this.neighbors[1].x, this.neighbors[1].y, -this.offset, this.neighbors[1].offset);
            ctx.lineWidth = 1
            ctx.globalAlpha = 1
            ctx.strokeStyle = "white"
            drawLine(this.x, this.y, this.neighbors[1].x, this.neighbors[1].y, -this.offset, this.neighbors[1].offset);
        }
        if (curMode.name == "default" && curMode.transform == true && curMode.point == this) {
            this.x = mx
            this.y = my
        }
        this.draw()
        
        if (this.neighbors[1] != null) {
            var theta = angle(this.x, this.y, this.neighbors[1].x, this.neighbors[1].y)
            var triPoint = midpoint(
                this.x - (Math.cos(theta) * this.offset), this.y - (Math.sin(theta) * this.offset), 
                this.neighbors[1].x + (Math.cos(theta) * this.neighbors[1].offset), this.neighbors[1].y + (Math.sin(theta) * this.neighbors[1].offset)
            )
            ctx.fillStyle = "white";
            drawTri(triPoint[0], triPoint[1], 10, 5, angle(this.x, this.y, this.neighbors[1].x, this.neighbors[1].y)+(.5*Math.PI))
        }
    }
}

function update() {
    ctx.fillStyle = "#161b1e"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    
    ctx.fillStyle = "#30383b"
    for (var y = 0; y < window.innerHeight; y += 50) {
        for (var x = 0; x < window.innerWidth; x += 50) {
            ctx.fillRect(x-1, y-1, 2, 2)
        }
    }
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    constantRotation = (constantRotation + 0.1) % (2*Math.PI)

    ctx.textAlign = "left"
    ctx.font = "15px IBM Plex Mono";
    ctx.fillText("k's simple paths v0.0.5 | mode: "+curMode.name, 5, 15);
    ctx.textAlign = "right"
    ctx.fillText("hold shift + click to create a basic path, right click to fillet", window.innerWidth-5, 15);
    if (points.length > 0) {

        if (curMode.name == "create") {
            ctx.strokeStyle = "gray";
            points.forEach((p, i) => {p.hover = i == points.length - 1});
            ctx.setLineDash([5, 15]);

            ctx.lineWidth = 1;
            drawLine(mx, my, points[points.length - 1].x, points[points.length - 1].y)
            ctx.setLineDash([]);
        }
        else if (curMode.name == "default") {
            if (curMode.point == null) {
                var nearestIndex = Point.closestToMouse(mx, my)[0];
                points[nearestIndex].hover = true;
            }else{
                curMode.point.hover = true;
            }
        }
        for (var i = 0; i < points.length; i++) {
            points[i].update();
        }
    }
    window.requestAnimationFrame(update);
}