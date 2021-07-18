const startTime = performance.now();
const pi = Math.PI;
function elapsedTime() {
    return (performance.now() - startTime)/1000;
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

function midpoint(x1, y1, x2, y2) 
{
    return [(x1 + x2)/2, (y1 + y2)/2]
}

function intersectLineSegments(x1, y1, x2, y2, x3, y3, x4, y4) {
    var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
    var u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
    return [x1 + (t * (x2 - x1)), y1 + (t * (y2 - y1))]
}

function intersectPointSegments(p1, p2, p3, p4) {
    return intersectLineSegments(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y)
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

function offsetLine(x1, y1, x2, y2, offsetStart=0, offsetEnd=0, theta=null) {
    if (Math.abs(offsetStart) > 0 || Math.abs(offsetStart) > 0)
    {
        if (theta == null) { theta = angle(x1, y1, x2, y2) }
        x1 += Math.cos(theta) * offsetStart
        y1 += Math.sin(theta) * offsetStart
        x2 += Math.cos(theta) * offsetEnd
        y2 += Math.sin(theta) * offsetEnd
    }
    return [x1, y1, x2, y2]
}

function drawLine(x1, y1, x2, y2, offsetStart=0, offsetEnd=0, theta=null, draw=true, inPathCallback=null) {
    points = offsetLine(x1, y1, x2, y2, offsetStart, offsetEnd, theta)
    if (draw) {
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        ctx.lineTo(points[2], points[3]);
        ctx.stroke();
        if (inPathCallback != null)
            inPathCallback();
        ctx.closePath();
    }
    return points
}
function drawLine(a, b) {
    points = offsetLine(a.x, a.y, b.x, b.y)
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    ctx.lineTo(points[2], points[3]);
    ctx.stroke();
    ctx.closePath();
}

function drawCircle(x, y, r, a1=0, a2=2*pi, inPathCallback=null) {
    ctx.beginPath();
    ctx.arc(x, y, r, a1, a2);
    ctx.stroke();
    if (inPathCallback != null)
        inPathCallback();
    ctx.closePath();
    return (2 * Math.PI * r) * Math.abs(a1%(2*pi) - a2%(2*pi))/(2*pi)
}

function drawLineFromPoints(p1, p2, offsetStart=0, offsetEnd=0, theta=null, draw=true, inPathCallback=null) {
    return drawLine(p1.x, p1.y, p2.x, p2.y, offsetStart, offsetEnd, theta, draw, inPathCallback)
}

function ray(x, y, angle, length, draw=true) {
    var point = {x: x + (Math.cos(angle) * length), y: y + (Math.sin(angle) * length)}
    if (draw) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        if (inPathCallback != null)
            inPathCallback()
        ctx.closePath();
    }
    return point
}

function closestPointOnLine( p, a, b ) {
    var atob = { x: b.x - a.x, y: b.y - a.y };
    var atop = { x: p.x - a.x, y: p.y - a.y };
    var len = atob.x * atob.x + atob.y * atob.y;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = Math.min( .99, Math.max( 0.01, dot / len ) );

    dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );

    return {
        x: a.x + atob.x * t,
        y: a.y + atob.y * t,
        t: t
    };
}

function vAdd(p1, p2) {
    return {x: p1.x + p2.x, y: p1.y + p2.y}
}

function vMult(p, f) {
    // var retval = {x: p.x, y: p.y}
    // for (var i = 1; i < arguments.length; i++) {
    //     retval.x *= arguments[i]
    //     retval.y *= arguments[i]
    // }
    return {x: p.x * f, y: p.y * f}
}

function vDiv(p, f) {
    return {x: p.x / f, y: p.y / f}
}

function vAngle(angle) {
    return {x: Math.cos(angle), y: Math.sin(angle)}
}

function v(x, y) {
    if (arguments.length == 1) {
        return {x: x[0], y: x[1]}
    }else if (arguments.length == 2)  {
        return {x: x, y: y}
    }
}
function vToList(v) { return [v.x, v.y]; }
function rad2deg(rad) { return rad * 180 / Math.PI; }

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

function easeInBounce(x) {
    return 1 - easeOutBounce(1 - x);
}

class PIDController {
    constructor (p, i, d, timestep=0.02) {
        this.p = p;
        this.i = i;
        this.d = d;
        this.timestep = timestep;
        this.setpoint = 0;

        this.sumError = 0;
        this.lastError = 0;
    }

    setSetpoint(setpoint) {
        this.setpoint = setpoint;
    }

    calculate(value) {
        var error = this.setpoint - value;
        this.sumError += error * this.timestep;

        var p = this.p * error;
        var i = this.i * this.sumError;
        var d = this.d * ((error - this.lastError) / this.timestep);
        this.lastError = error;
        return p + i + d;
    }

    reset() {
        this.sumError = 0;
        this.lastError = 0;
    }
}