window.onload = function() {
    update();
};
const pi = Math.PI
var time = 0;
var frame = 0;
const t = {
    ops: ["transform", "create", "fillet"],
    opKeybinds: ["", "Shift", "f"],
    snap: false,
    pixelsPerUnit: 50,
    units: "ft",
    robotWidth: 2, // in units
    currentMode: null,
    selected: null,
    path: [],
    pathSegments: [],
    keysDown: {},
    mx: 0,
    my: 0,
    click: false,
    selectDistance:50,
    pathString: "",
    opNameToIndex: (name) => { return t.ops.indexOf(name); },
    unitsToPixels: (units) => { return units * t.pixelsPerUnit; },
    createPoint: (x, y) => {
        if (t.path.length == 0) {
            t.pathSegments.push(null);
        }
        t.pathSegments.push(-1);
        t.path.push({
            i: t.path.length,
            x: x,
            y: y,
            r: 0.5,
            get filletOffset() { 
                //console.log()//t.path[].i)
                return this.fillet != undefined ? this.fillet.offset : 0;
            }
        });
    },
    closestPointToCoords: (x, y) => {
        let distToCoords = [];
        for (var i = 0; i < t.path.length; i++) {
            distToCoords.push(parseInt(Math.hypot(x-t.path[i].x, y-t.path[i].y)));
        }
        return [distToCoords.indexOf(Math.min(...distToCoords)), Math.min(...distToCoords)];
    },
    fillet: (i, factor) => {
        let cur = t.path[i]
        let back = t.path[i-1]
        let fwd = t.path[i+1]
        let backNormal = normal(cur, back);
        let frontNormal = normal(fwd, cur);
        let flip = math.dot(frontNormal, vToList(vadd(back, vmult(cur, -1)))) < 0 ? -1 : 1;
        let backExtension = vmult(vector(backNormal), cur.r * flip)
        let frontExtension = vmult(vector(frontNormal), cur.r * flip)

        let int = intersectPointSegments(
            vadd(cur, backExtension),
            vadd(back, backExtension),
            vadd(cur, frontExtension),
            vadd(fwd, frontExtension)
        );
        
        // drawLineFromPoints(fwd, vadd(fwd, frontExtension));

        let a1 = angle(int[0], int[1], int[0] - (cur.r * backNormal[0]), int[1] - (cur.r * backNormal[1]), flip == 1)
        let a2 = angle(int[0], int[1], int[0] - (cur.r * frontNormal[0]), int[1] - (cur.r * frontNormal[1]), flip == 1)
        //let offset = Math.sqrt(distance(cur.x, cur.y, int[0], int[1])**2 - cur.r**2)
        let boom = [vadd(cur, vmult(vAngle(a1-pi/2), Math.hypot(cur.x - back.x, cur.y - back.y) - back.filletOffset)), vadd(cur, vmult(vAngle(a2+pi/2), Math.hypot(cur.x - fwd.x, cur.y - fwd.y) - fwd.filletOffset))]//[midpoint(cur.x, cur.y, back.x, back.y), midpoint(cur.x, cur.y, fwd.x, fwd.y)]
        //if (t.closestPointToCoords(t.mx, t.my)[0] == i) {
        //    setBrush("yellow", 3)
        //    drawLineFromPoints(cur, vadd(cur, vmult(vAngle(a1-pi/2), Math.hypot(cur.x - back.x, cur.y - back.y) - back.filletOffset)))
        //    drawLineFromPoints(cur, vadd(cur, vmult(vAngle(a2+pi/2), Math.hypot(cur.x - fwd.x, cur.y - fwd.y) - fwd.filletOffset)))
        //    setBrush()
        //}
        let titan = Math.min(Math.hypot(boom[0].x - cur.x, boom[0].y - cur.y), Math.hypot(boom[1].x - cur.x, boom[1].y - cur.y))
        let backMidp = vadd(cur, vmult(vAngle(a1-pi/2), titan*flip*factor)) //vector(midpoint(cur.x, cur.y, back.x, back.y));
        let frontMidp = vadd(cur, vmult(vAngle(a2+pi/2), titan*flip*factor)) //vector(midpoint(cur.x, cur.y, fwd.x, fwd.y));

        //console.log(backMidp, frontMidp)
        let max = intersectPointSegments(
            backMidp, vadd(backMidp, backExtension),
            frontMidp, vadd(frontMidp, frontExtension)
        );
        let offset = Math.sqrt(distance(cur.x, cur.y, max[0], max[1])**2 - distance(frontMidp.x, frontMidp.y, max[0], max[1])**2)
            
        setBrush("white", 1, 0.1)
        ctx.setLineDash([5, 5])
        ctx.beginPath();
        ctx.arc(max[0], max[1], distance(frontMidp.x, frontMidp.y, max[0], max[1]), 0, pi * 2)
        ctx.stroke()
        ctx.closePath()
        ctx.setLineDash([])
        setBrush();
        ctx.fillRect(max[0], max[1], 2, 2)

        return {
            x: max[0],//int[0],
            y: max[1],//int[1],
            r: Math.max(distance(frontMidp.x, frontMidp.y, max[0], max[1]), 2),
            angle1: flip > 0 ? a1 : a2,
            angle2: flip > 0 ? a2 : a1,
            flip: flip,
            offset: offset,
            backNormal: backNormal,
            frontNormal: frontNormal,
            backAngle: angle(cur.x, cur.y, back.x, back.y),
            frontAngle: angle(cur.x, cur.y, fwd.x, fwd.y)
        };
    }
}

t.currentMode = [t.ops[0], 0];
t.opKeybinds = Object.assign({}, ...t.opKeybinds.map((x, i) => ({[x]: t.ops[i]})));

window.onkeyup = function(e) {
    t.keysDown[e.key] = false;
    t.currentMode = [t.ops[0], 0];
}

window.onkeydown = function(e) {
    if (e.key == "f")
        e.preventDefault();
    t.keysDown[e.key] = true;
    if (e.key in t.opKeybinds) {
        t.currentMode = [t.opKeybinds[e.key], t.opNameToIndex(t.opKeybinds[e.key])];
    }
}

window.addEventListener("mousedown", e => {
    switch(t.currentMode[0]) {
        case "transform":
            var closest = t.closestPointToCoords(t.mx, t.my);
            if (closest[1] < t.selectDistance) {
                t.selected = closest[0];
            }
            break;
        case "create":
            t.createPoint(t.mx, t.my);
            break;
    }
});

window.addEventListener("mouseup", e => {
    t.click = false;
    t.selected = null;
});

window.addEventListener("mousemove", e => {
    if (t.keysDown.Control) {
        t.mx = Math.round(e.offsetX / t.pixelsPerUnit) * t.pixelsPerUnit;
        t.my = Math.round(e.offsetY / t.pixelsPerUnit) * t.pixelsPerUnit;
    } else {
        t.mx = e.offsetX;
        t.my = e.offsetY;
    }
    t.click = true;
});

function renderGrid() {
    ctx.fillStyle = "#30383b";
    for (var y = 0; y < window.innerHeight; y += t.pixelsPerUnit) {
        for (var x = 0; x < window.innerWidth; x += t.pixelsPerUnit) {
            ctx.fillRect(x-1, y-1, 2, 2);
        }
    }
}

function setBrush(color="white", thickness=1, alpha=1) {
    ctx.globalAlpha = alpha
    ctx.lineWidth = thickness
    ctx.fillStyle = color
    ctx.strokeStyle = color
}

function rotate(x, y, angle, callback=null, reset=true) {
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (callback !== null)
        callback();
    if (reset)
        ctx.resetTransform();
}

function renderPath() {
    var separatorWidth = 5;
    t.pathString = "";
    var closest = t.closestPointToCoords(t.mx, t.my);
    if (t.selectDistance > closest[1]) {
        rotate(t.path[closest[0]].x, t.path[closest[0]].y, time/2, ()=>{
            setBrush("white", 2, .3);
            var x = Math.sin(time) * 1 + 10
            ctx.strokeRect(-x, -x, x * 2, x * 2)
            setBrush();
        });
    } else {
        rotate(t.mx, t.my, time/2, ()=>{
            setBrush("white", 2, 1);
            var x = Math.sin(time) * 1 + 10
            ctx.beginPath();
            drawLine(-10, 0, -3, 0);
            drawLine(10, 0, 3, 0);
            drawLine(0, 3, 0, 10);
            drawLine(0, -3, 0, -10);
            setBrush();
        })
    }

    t.path.forEach((cur, i) => {
        setBrush();
        if (i > 0) {
            var prev = t.path[i - 1];
            if (i < t.path.length - 1) {
                var next = t.path[i + 1];
                var fillet = t.fillet(i, cur.r); // ((Math.sin(time))+1)/2);
                cur.fillet = fillet;
                // Draw the fillet arc
                ctx.beginPath();
                ctx.arc(fillet.x, fillet.y, fillet.r, fillet.angle1, fillet.angle2)

                // Robot path
                setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                ctx.stroke();

                // Line
                setBrush();
                ctx.stroke();
                ctx.closePath();
                
                // Draw line from previous fillet to this
                setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);      
                if (i > 1)       
                    var p = drawLineFromPoints(prev, cur, prev.fillet != undefined ? -prev.fillet.offset : -1, cur.fillet.offset)
                else
                    var p = drawLineFromPoints(prev, cur, t.unitsToPixels(t.robotWidth)/2, cur.fillet.offset)
                setBrush();
                drawTri(fillet.x, fillet.y, 0, 10, 10);
                
                p = drawLineFromPoints(next, cur, next.fillet != undefined ? -next.fillet.offset : -1, cur.fillet.offset, null, false)
                drawLineFromPoints(vadd(vector(p[2], p[3]), vmult(vector(fillet.frontNormal), -separatorWidth)), vadd(vector(p[2], p[3]), vmult(vector(fillet.frontNormal), separatorWidth)))

                p = drawLineFromPoints(prev, cur, prev.fillet != undefined ? -prev.fillet.offset : -1, cur.fillet.offset)
                drawLineFromPoints(vadd(vector(p[2], p[3]), vmult(vector(fillet.backNormal), -separatorWidth)), vadd(vector(p[2], p[3]), vmult(vector(fillet.backNormal), separatorWidth)))
                    
                t.pathString += `l${cur.i} ${(Math.hypot(p[0] - p[2], p[1] - p[3])/t.pixelsPerUnit).toFixed(3)} ${t.units} | `
                t.pathString += `c${cur.i} ${((fillet.r.toFixed(3) * fillet.flip)/t.pixelsPerUnit).toFixed(3)} ${t.units} ${Math.abs((fillet.angle1 - fillet.angle2)*180/pi).toFixed(3)} deg | `;
            }
            else if (prev.fillet != undefined){
                // last line
                setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                var p = drawLine(prev.x, prev.y, cur.x, cur.y, -prev.fillet.offset, -t.unitsToPixels(t.robotWidth)/2);
                setBrush();
                drawLine(prev.x, prev.y, cur.x, cur.y, -prev.fillet.offset, -1);
                t.pathString += `l${cur.i} ${(Math.hypot(p[0] - p[2], p[1] - p[3])/t.pixelsPerUnit).toFixed(3)} ${t.units} | `
            }
            else {
                // 2 point line
                setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                var p = drawLineFromPoints(prev, cur, t.unitsToPixels(t.robotWidth)/2, -t.unitsToPixels(t.robotWidth)/2);
                setBrush();
                drawLineFromPoints(prev, cur);
                t.pathString += `l${cur.i} ${(Math.hypot(p[0] - p[2], p[1] - p[3])/t.pixelsPerUnit).toFixed(3)} ${t.units} | `
            }

            var mid = midpoint(p[0], p[1], p[2], p[3])
            drawTri(mid[0], mid[1], 10, 7, angle(p[0], p[1], p[2], p[3])+pi/2)

        }

        if (i == t.selected) {
            rotate(t.mx, t.my, time/2, ()=>{
                setBrush("#ff6d73", 3);
                var x = Math.sin(time) * 1 + 10
                ctx.strokeRect(-x, -x, x * 2, x * 2)
                setBrush();
            })
            switch(t.currentMode[0]) {
                case "transform":
                    cur.x = t.mx;
                    cur.y = t.my;
                    break;
                case "create":
                    setBrush("white", 1, 0.6);
                    ctx.setLineDash([5, 2]);
                    drawLine(cur.x, cur.y, t.mx, t.my)
                    ctx.setLineDash([]);
                    setBrush();
                    break;
            }
        }

        if (t.currentMode[0] == "create" && i == t.path.length - 1) {
            setBrush("white", 1, (Math.sin(time*2)+1)/5);
            ctx.setLineDash([5, 5]);
            drawLine(cur.x, cur.y, t.mx, t.my)
            ctx.setLineDash([]);
            setBrush();
        }
        setBrush("#fff145");
        rotate(cur.x, cur.y, pi/4, () => {
            ctx.fillRect(-4, -4, 8, 8);
        });
    });
    return
}
function update() {
    frame += 1;
    time += 0.1%(2*pi)
    ctx.fillStyle = "#161b1e";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = "white";
    ctx.fillText("k's simple paths v0.0.6 | mode: " + t.currentMode[0], 5, 15);

    renderGrid();
    renderPath();

    if (t.path.length < 2) {
        document.getElementById("path-string").textContent = "PATH STRING: [no path yet!]"
    } else {
        document.getElementById("path-string").textContent = "PATH STRING: " + t.pathString.slice(0, t.pathString.length - 3);
    }
    window.requestAnimationFrame(update);
}