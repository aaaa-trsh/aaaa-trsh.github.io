class Vector2 {
    constructor(x, y, i) {
        this.x = x;

        if (y !== undefined)
            this.y = y;
        else {
            this.y = x;
        }

        if (i !== undefined)
            this.i = i;
        else {
            this.i = -1;
        }
    }

    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    mul(other) {
        return new Vector2(this.x * other, this.y * other);
    }

    scale(other) {
        return new Vector2(this.x * other.x, this.y * other.y);
    }

    sub(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    dist(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }

    set(other) {
        this.x = other.x;
        this.y = other.y;
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    toArray() {
        return [this.x, this.y];
    }

    length() {
        return Math.hypot(this.x, this.y);
    }

    normalized() {
        let len = this.length();
        return new Vector2(this.x / len, this.y / len);
    }

    angleTo(other) {
        return Math.atan2(this.y - other.y, this.x - other.x);
    }

    det(other) {
        let a = this.x;
        let b = other.x;
        let c = this.y;
        let d = other.y;
        return a*d - b*c;
    }
}

let pixelsPerUnit = 30;

let robotPos = new Vector2(0, 0);
let robotAngle = 0;
let selected = null;
let closest = null;
let path = [];
let t = 0
let t_i = 0

let mousePos = new Vector2(0, 0);
let mouseDown = false;
let keysDown = {};

const KEY_DEBUG = false;
const MAX_VALUE = 10000000000;
const MAX_POINTS = 1000;


window.addEventListener("load", () => {
    update();
});

window.addEventListener("mousemove", (e) => {
    mousePos = new Vector2(e.clientX, e.clientY);
    if(e.target == canvas) {
        if (mouseDown && selected !== null && mousePos.dist(selected) < 100) {
            selected.set(mousePos);
        }

        var close = new Vector2(MAX_VALUE, MAX_VALUE);
        for (i = 0; i < path.length; i++) {
            if (path[i].dist(mousePos) < close.dist(mousePos)) {
                close = path[i];
            }
        }
        closest = close;
    }
});

window.addEventListener("mousedown", e => {
    if(e.target == canvas) {
        if (closest != null && closest.dist(mousePos) < 30) {
            if (keysDown["Shift"])
                path.splice(closest.i, 1);
            else
                selected = closest;
        } else {
            var newPoint = new Vector2(mousePos.x, mousePos.y, path.length);
            selected = newPoint;
            path.push(newPoint);
        }
    }
    mouseDown = true;
});

window.addEventListener("mouseup", e => {
    mouseDown = false;
});

window.onkeyup = function(e) {
    keysDown[e.key] = false;
}

window.onkeydown = function(e) {
    keysDown[e.key] = true;
    if (KEY_DEBUG) {
        console.log(e.key);
    }

    if(
        (e.key == "Delete" || e.key == "x") && 
        selected != null
    ) {
        path.splice(selected.i, 1);
    }
}

function setBrush(color="white", thickness=1, alpha=1) {
    ctx.globalAlpha = alpha
    ctx.lineWidth = thickness
    ctx.fillStyle = color
    ctx.strokeStyle = color
}

function drawPoint(size, point) {
    ctx.fillRect(point.x-(size/2), point.y-(size/2), size, size);
}

function closestPointToRobot() {
    var closestDistance = MAX_VALUE;
    var closestPose = new Vector2(MAX_VALUE, MAX_VALUE);

    for (var i = path.length - 1; i >= 0; i--) {
        var abDistance = robotPos.dist(path[i]);
        if (abDistance < closestDistance) {
            closestDistance = abDistance;
            closestPose = path[i];
        }
    }
    return closestPose;
}

function sign(x) {
    return x == 0 ? 1 : Math.sign(x);
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

function getLookaheadPointGH2(x, y, r) {
    var lookahead = null;

    // iterate through all pairs of points
    for (var i = 0; i < path.length - 1; i++) {
        // form a segment from each two adjacent points
        var segmentStart = path[i];
        var segmentEnd = path[i + 1];

        // translate the segment to the origin
        var p1 = new Vector2(segmentStart.x - x, segmentStart.y - y);
        var p2 = new Vector2(segmentEnd.x - x, segmentEnd.y - y);

        // calculate an intersection of a segment and a circle with radius r (lookahead) and origin (0, 0)
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var D = p1.x * p2.y - p2.x * p1.y;

        // if the discriminant is zero or the points are equal, there is no intersection
        var discriminant = r * r * d * d - D * D;
        if (discriminant < 0 || p1.equals(p2)) continue;

        // the x components of the intersecting points
        var x1 = (D * dy + sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);
        var x2 = (D * dy - sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);

        // the y components of the intersecting points
        var y1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);
        var y2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);

        // whether each of the intersections are within the segment (and not the entire line)
        var validIntersection1 = Math.min(p1.x, p2.x) < x1 && x1 < Math.max(p1.x, p2.x)
            || Math.min(p1.y, p2.y) < y1 && y1 < Math.max(p1.y, p2.y);
        var validIntersection2 = Math.min(p1.x, p2.x) < x2 && x2 < Math.max(p1.x, p2.x)
            || Math.min(p1.y, p2.y) < y2 && y2 < Math.max(p1.y, p2.y);

        // remove the old lookahead if either of the points will be selected as the lookahead
        if (validIntersection1 || validIntersection2) lookahead = null;

        // select the first one if it's valid
        if (validIntersection1) {
            lookahead = new Vector2(x1 + x, y1 + y);
        }

        // select the second one if it's valid and either lookahead is none,
        // or it's closer to the end of the segment than the first intersection
        if (validIntersection2) {
            if (lookahead == null || Math.abs(x1 - p2.x) > Math.abs(x2 - p2.x) || Math.abs(y1 - p2.y) > Math.abs(y2 - p2.y)) {
                lookahead = new Vector2(x2 + x, y2 + y);
            }
        }
    }

    // special case for the very last point on the path
    if (path.length > 0) {
       var lastPoint = path[path.length - 1];

       var endX = lastPoint.x;
       var endY = lastPoint.y;

       // if we are closer than lookahead distance to the end, set it as the lookahead
       if (Math.sqrt((endX - x) * (endX - x) + (endY - y) * (endY - y)) <= r) {
           return lastPoint;
       }
    }

    return lookahead != null ? lookahead : null;
}

function shortAngleDist(fromAngle, toAngle) {
    var difference = (toAngle - fromAngle) % (Math.PI * 2);
    return 2 * difference % (Math.PI * 2) - difference;
}

function normalize(val, max, min) { return (val - min) / (max - min); }

function update() {
    ctx.fillStyle = "#161b1e";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    setBrush();
    for (i = 0; i < path.length; i++) {
        path[i].i = i;
        ctx.globalAlpha = 1;
        if (selected !== null && i == selected.i)
            setBrush("deepskyblue");

        drawPoint(i == closest.i && closest.dist(mousePos) < 30 ? 6 : 4, path[i]);
        
        setBrush();
        ctx.globalAlpha = 0.1;
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(path[i].x, path[i].y);
            ctx.lineTo(path[i - 1].x, path[i - 1].y);
            ctx.stroke();
            ctx.closePath();
        }
    }
    ctx.globalAlpha = 1;

    if (path.length > 1) {
        robotPos.set(keysDown["f"] ? mousePos : path[0]);
        robotAngle = path[0].angleTo(path[1]);

        //const p = numberInputs["p_input"].value();
        //const i = numberInputs["i_input"].value();
        //const d = numberInputs["d_input"].value();

        var pointCount = 0;
        var prevRobotPos = robotPos;
        var prevPrevRobotPos = robotPos;
        var trackWidth = numberInputs["trackwidth_input"].value() * pixelsPerUnit;
        while (robotPos.dist(path[path.length - 1]) > 5) {
            var look = getLookaheadPointGH2(robotPos.x, robotPos.y, numberInputs["lookahead_input"].value() * pixelsPerUnit);

            if (look == null) look = closestPointToRobot();

            robotAngle += shortAngleDist(robotAngle, robotPos.angleTo(look)) * numberInputs["p_input"].value();
            robotPos = robotPos.add(Vector2.fromAngle(robotAngle).mul(-10));
            
            //drawPoint(2, robotPos);
            setBrush("white");
            drawLine(prevRobotPos, robotPos);
            var relativeLookahead = look.sub(robotPos);

            if (pointCount % 20 == 0) {
                drawX(look.x, look.y, 5)
                drawX(robotPos.x, robotPos.y, 5)

                setBrush("yellow", 1, 0.2);

                drawLine(robotPos, robotPos.add(Vector2.fromAngle(robotAngle + pi/2).mul(relativeLookahead)));
                
                var curvCenter = CircleCenter2PointRad(robotPos, look, Math.abs(relativeLookahead.x));
                console.log(curvCenter);
                drawCircle(
                    curvCenter.x,
                    curvCenter.y,
                    Math.abs(relativeLookahead.x),
                )
            }
            //setBrush("darkcyan", trackWidth, 0.1);
            //drawLine(prevPrevRobotPos, robotPos);

            setBrush("darkcyan", 1, 0.6);
            drawLine(
                prevPrevRobotPos.add(
                    Vector2.fromAngle(prevRobotPos.angleTo(robotPos) + Math.PI / 2)
                    .mul(trackWidth/2)
                ), 
                robotPos.add(
                    Vector2.fromAngle(prevRobotPos.angleTo(robotPos) + Math.PI / 2)
                    .mul(trackWidth/2)
                )
            );
            
            drawLine(
                prevPrevRobotPos.add(
                    Vector2.fromAngle(prevRobotPos.angleTo(robotPos) + Math.PI / 2)
                    .mul(-trackWidth/2)
                ), 
                robotPos.add(
                    Vector2.fromAngle(prevRobotPos.angleTo(robotPos) + Math.PI / 2)
                    .mul(-trackWidth/2)
                )
            );
            
            pointCount++;
            if (pointCount > MAX_POINTS)
               break;
            prevPrevRobotPos = prevRobotPos;
            prevRobotPos = robotPos;
        }
    }
    setBrush();
    ctx.fillStyle = "white";
    ctx.fillText("quokka pure pusuit", 5, 15);
    window.requestAnimationFrame(update);
}