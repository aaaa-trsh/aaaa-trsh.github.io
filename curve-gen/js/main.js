const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let mx = 0;
let my = 0;
let curves = [];
let keysDown = {};
let clicking = false;

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
// on click
canvas.addEventListener('mousedown', click);
canvas.addEventListener('mouseup', () => { clicking = false; });
//on move
canvas.addEventListener('mousemove', move);

window.onkeyup = function(e) {
    keysDown[e.key] = false;
}
window.onkeydown = function(e) {
    keysDown[e.key] = true;
    // console.log(e.key);
}

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function getAllHandles() {
    let handles = [];
    curves.forEach((curve, i) => {
        handles.push(
            {cid:i, p: curve.p0, orbit: null},
            {cid:i, p: curve.p1, orbit: curve.p0},
            {cid:i, p: curve.p2, orbit: curve.p3},
            {cid:i, p: curve.p3, orbit: null},
        );
        // if (i == curves.length - 1) 
            // handles.push(curve.p3);
    });
    return handles;
}

function getOtherOrbitingHandle(handle) {
    let handles = getAllHandles();
    let retval = handles.filter(h => (h != handle && h.cid != handle.cid && h.orbit == handle.orbit));
    return retval.length > 0 ? retval[0] : null;
}

function getOrbitingHandles(handle) {
    let handles = getAllHandles();
    let retval = handles.filter(h => (h != handle && h.orbit == handle.p));
    return retval;
}

function selectableHandle() {
    let handles = getAllHandles();
    let minDist = Number.MAX_VALUE;
    let closest = null;
    handles.forEach(handle => {
        if (Point.dist(handle.p, new Point(mx, my)) < minDist) {
            minDist = Point.dist(handle.p, new Point(mx, my));
            closest = handle;
        }
    });

    return minDist < 30 ? closest : null;
}

function move(e) {
    let rect = e.target.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top; 

    if (!keysDown.Shift) {
        let sHandle = selectableHandle();
        if (sHandle != null && clicking) {
            sHandle.p.x = mx;
            sHandle.p.y = my;

            if (sHandle.orbit != null) {
                let other = getOtherOrbitingHandle(sHandle);
                if (other != null) {
                    other.p.x = -(sHandle.p.x - other.orbit.x) + sHandle.orbit.x;
                    other.p.y = -(sHandle.p.y - other.orbit.y) + sHandle.orbit.y;
                }
            } else {
                let orbiting = getOrbitingHandles(sHandle);
                // console.log(orbiting);
                orbiting.forEach((h, i) => {
                    h.p.x = handleOffsets[i].x + sHandle.p.x;
                    h.p.y = handleOffsets[i].y + sHandle.p.y;
                });
            }
        }
    }
}

let newCurvePoints = [];
let handleOffsets = [];
function click(e) {
    clicking = true;
    if (keysDown.Shift) {
        newCurvePoints.push(new Point(mx, my));
        
        if (newCurvePoints.length == 4) {
            curves.push(
                new CubicCurve(
                    newCurvePoints[0], 
                    newCurvePoints[1],
                    newCurvePoints[2], 
                    newCurvePoints[3]
                )
            );
            let prevCurve = curves[curves.length - 1];
            newCurvePoints = [
                prevCurve.p3, 
                Point.add(prevCurve.p3, Point.sub(prevCurve.p3, prevCurve.p2))
            ];
        }
    } else {
        let sHandle = selectableHandle();
        handleOffsets = [];
        if (sHandle != null && sHandle.orbit == null) {    
            let orbiting = getOrbitingHandles(sHandle);
            orbiting.forEach(h => {
                handleOffsets.push(Point.sub(h.p, sHandle.p));
            });
        }
    }
}

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

let moving = 0;
function drawCurve(curve, drawArrows=true, drawDebug=false) {
    const samples = 100;
    let style = ctx.strokeStyle;

    for (let i = 1; i < samples; i++) {
        const p = curve.getPoint(i / samples);
        const prev = curve.getPoint((i - 1) / samples);
        ctx.globalAlpha = 0.4;
        drawLine(p, prev);
        ctx.globalAlpha = 1;

        if (i % 20 == 0 && drawArrows) {
            let fwd = Point.mul(
                Point.sub(p, prev).normalize(), 
                4
            ).rotate(0);
            let left = Point.mul(
                Point.sub(p, prev).normalize(), 
                4
            ).rotate(90);
            let right = Point.mul(
                Point.sub(p, prev).normalize(), 
                4
            ).rotate(-90);
            ctx.lineWidth = 2;
            drawLine(Point.add(fwd, p), Point.add(left, p));
            drawLine(Point.add(fwd, p), Point.add(right, p));
            ctx.lineWidth = 1;
        }

        let movingIndex = Math.floor((Math.sin(moving) + 1)/2 * samples);
        if (drawDebug && i > movingIndex - 10 && i < movingIndex) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "blue";
            drawLine(p, 
                Point.add(
                    Point.mul(
                        Point.sub(p, prev).normalize(), 
                        10
                    ).rotate(Math.PI / 2), 
                    p
                )
            );
            ctx.strokeStyle = "red";
            drawLine(p, 
                Point.add(
                    Point.mul(
                        Point.sub(p, prev).normalize(), 
                        10
                    ).rotate(0), 
                    p
                )
            );
            ctx.globalAlpha = Math.abs(i - (movingIndex - 10)) / (10);
            ctx.strokeStyle = "white";
            let curvature = 1/curve.getCurvature(i / samples);
            drawCircle(
                Point.add(
                    Point.mul(
                        Point.sub(p, prev).normalize(), 
                        curvature
                    ).rotate(Math.PI / 2), 
                    p
                ),
                Math.abs(curvature)
            )
            ctx.globalAlpha = 1;
            ctx.strokeStyle = style;
        }
        // ctx.beginPath();
        // ctx.arc(p.x, p.y, curve.getCurvature(t)/100, 0, 2 * Math.PI);
        // ctx.stroke();
        // ctx.closePath();
    }
}

update();
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // previs
    if(keysDown.Shift && newCurvePoints.length > 0) {
        let mousePoint = new Point(mx, my);
        let preVisCurve = new CubicCurve(
            newCurvePoints[0],
            newCurvePoints.length > 1 ? newCurvePoints[1] : mousePoint,
            newCurvePoints.length > 2 ? newCurvePoints[2] : mousePoint,
            newCurvePoints.length > 3 ? newCurvePoints[3] : mousePoint
        )
        ctx.strokeStyle = "#2a4552";
        ctx.lineWidth = 2;
        drawCurve(preVisCurve, false);
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
    }

    // draw curves
    ctx.lineWidth = 1;
    for (let i = 0; i < curves.length; i++) {
        ctx.strokeStyle = "#90d537";
        drawCurve(curves[i], true); 
    }

    // draw handles
    let handles = getAllHandles();
    let closest = selectableHandle();
    for (let i = 0; i < handles.length; i++) {
        if (i < handles.length - 1 && (handles[i].orbit == null || handles[i + 1].orbit == null)) {
            ctx.strokeStyle = "#2a4552";
            drawLine(handles[i].p, handles[i+1].p);
            ctx.strokeStyle = "white";
        }

        if (closest != null && closest.p == handles[i].p) ctx.lineWidth = 3;
        else ctx.lineWidth = 1;

        if(handles[i].orbit != null)
            ctx.strokeStyle = "#7cd5f1";
        else {
            ctx.strokeStyle = "#fff";
            ctx.lineWidth += 2;
        }
        
        drawCircle(handles[i].p, closest == handles[i] ? 4 : 5);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
    }

    // reset new points when not adding
    if (!keysDown.Shift && curves.length > 0) {
        let lastCurve = curves[curves.length - 1];
        newCurvePoints = [
            lastCurve.p3, 
            Point.add(lastCurve.p3, Point.sub(lastCurve.p3, lastCurve.p2))
        ];
    }
    // console.log(curves[0].getLength());
    moving = (moving+0.03);
    window.requestAnimationFrame(update);
}