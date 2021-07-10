window.addEventListener("load", () => {
    t.mapFromSource(canvas.width/2, t.pixelsPerUnit, 629.5/12, 323.25/12, 0.036649659863945576, "./assets/2021.png", true);
    update();
});

/*
FIELD SIZE: 
629.5in long distance
323.25in short distacne
OHHHOBHHHOHH YEAHHH

*/
const pi = Math.PI
var time = 0;
var frame = 0;
const t = {
    modes: {
        transform: {
            keybind: "",
            onclick: () => {
                var closest = t.closestPointToCoords(t.mx, t.my);
                if (closest[1] < t.selectDistance) {
                    t.selected = closest[0];
                }
            },
            onrelease: () => {},
            onstart: () => {
                document.body.style.cursor = "move";
            },
            onhoverstart: () => { document.body.style.cursor = "move"; },
            onhoverexit: () => { document.body.style.cursor = "default"; },
            render: (pathLayer) => {
                pathLayer()
                if (t.selected != null) {
                    var cur = t.path[t.selected]
                    var i = t.selected
                    var p = [...t.path]
                    p[p.indexOf(cur)] = { x: -10000000, y:-10000000}
                    var closest = t.path[t.closestPointToCoords(t.mx, t.my, p)[0]];
                    if (Math.hypot(cur.x - closest.x, cur.y - closest.y) > 10) {
                        cur.x = t.mx;
                        cur.y = t.my;
                        rotate(t.mx, t.my, time/2, ()=>{
                            setBrush("#ff6d73", 3);
                            var x = Math.sin(time) * 1 + 10
                            ctx.strokeRect(-x, -x, x * 2, x * 2)
                            setBrush();
                        });
                    }
                    else {
                        while(Math.hypot(cur.x - closest.x, cur.y - closest.y) < 12) {
                            cur.x -= 5;
                            cur.y -= 5;
                        }
                    }
                }
            }
        },
        create: {
            keybind: "Shift",
            onclick: () => {
                if (t.path.length == 0 || Math.hypot(t.path[t.path.length - 1].x - t.mx, t.path[t.path.length - 1].y - t.my) > 10)
                    t.createPoint(t.mx, t.my);
            },
            onrelease: () => {},
            onstart: () => {
                document.body.style.cursor = "crosshair";
            },
            onhoverstart: () => {},
            onhoverexit: () => {},
            render: (pathLayer) => {
                if (t.path.length > 0) {
                    var last = t.path[t.path.length - 1]
                    setBrush("white", 1, (Math.sin(time*2)+1)/5);
                    ctx.setLineDash([5, 5]);
                    drawLine(last.x, last.y, t.mx, t.my)
                    ctx.setLineDash([]);
                    setBrush();
                }
                pathLayer()
            }
        }, 
        fillet: {
            keybind: "f",
            onclick: () => {
                var closest = t.closestPointToCoords(t.mx, t.my);
                if (closest[1] < t.selectDistance) {
                    t.selected = closest[0];
                }
            },
            onrelease: () => {
                document.body.style.cursor = "grab";
            },
            onstart: () => {
                document.body.style.cursor = "default";
            },
            onhoverstart: (i) => { if (i > 0 && i < t.path.length - 1) { document.body.style.cursor = "grab";} },
            onhoverexit: () => { document.body.style.cursor = "default"; },
            render: (pathLayer) => {
                if (t.selected != null) {
                    var cur = t.path[t.selected]
                    var i = t.selected
                    if (i > 0 && i < t.path.length - 1 && cur.fillet.selected != null) {
                        setBrush("#42b6f1", 2, .5)
                        drawLineFromPoints(cur, cur.fillet.selected.max, -Math.hypot(cur.x - cur.fillet.selected.mouseProjected.x, cur.y - cur.fillet.selected.mouseProjected.y) + cur.fillet.r);
                        ctx.globalAlpha = 0.2
                        drawLineFromPoints(cur, cur.fillet.selected.mouseProjected, -1, cur.fillet.r);
                        setBrush();
                        var n = v(normal(cur, cur.fillet.selected.max))
                        drawLineFromPoints(vAdd(cur.fillet.selected.mouseProjected, vMult(n, -3)), vAdd(cur.fillet.selected.mouseProjected, vMult(n, 3)))
                        ctx.closePath();
                        document.body.style.cursor = "grabbing";
                    }
                }
                pathLayer()
            }
        }
    },
    maps: [],
    pixelsPerUnit: 40,
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
    selectDistance: 50,
    pathString: "",
    inputEnabled: true,
    modeNameToIndex: (name) => { return Object.keys(t.modes).indexOf(name); },
    modeFromIndex: (i) => { return t.modes[Object.keys(t.modes)[i]] },
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
            r: 0.1,
            start: true,
            get filletOffset() { 
                return this.fillet != undefined ? this.fillet.offset : 0;
            }
        });
    },
    createMap: (x, y, w, h, img) => {
        t.maps.push({
            x: x,
            y: y,
            w: w,
            h: h,
            img: img,
        });
    },
    mapFromSource: (x, y, w, h, ppunit, src, cx=false, cy=false) => {
        var img = document.createElement("IMG");
        img.src = src
        img.onload = () => {
            var width = t.pixelsPerUnit * (img.width/(1/(w/img.width)));
            var height = t.pixelsPerUnit * (img.height/(1/((h/img.height))));
            t.maps.push({
                x: cx ? x - width/2 : x,
                y: cy ? y - height/2 : y,
                w: width,
                h: height,
                img: img,
            });
        };
    },
    closestPointToCoords: (x, y, path=null) => {
        if (path == null) { path = t.path; }
        let distToCoords = [];
        for (var i = 0; i < path.length; i++) {
            distToCoords.push(parseInt(Math.hypot(x-path[i].x, y-path[i].y)));
        }
        return [distToCoords.indexOf(Math.min(...distToCoords)), Math.min(...distToCoords)];
    },
    fillet: (i, changeFilletRad) => {
        let cur = t.path[i];
        let back = t.path[i-1];
        let fwd = t.path[i+1];
        let backNormal = normal(cur, back);
        let frontNormal = normal(fwd, cur);
        let flip = math.dot(frontNormal, vToList(vAdd(back, vMult(cur, -1)))) < 0 ? -1 : 1;
        let backExtension = vMult(v(backNormal), cur.r * flip);
        let frontExtension = vMult(v(frontNormal), cur.r * flip);

        if (!arrayEquals(backNormal, frontNormal) && !arrayEquals(backNormal, [-frontNormal[0], -frontNormal[1]])) {
            let int = intersectPointSegments(
                vAdd(cur, backExtension),
                vAdd(back, backExtension),
                vAdd(cur, frontExtension),
                vAdd(fwd, frontExtension)
            );
            let a1 = angle(int[0], int[1], int[0] - (cur.r * backNormal[0]), int[1] - (cur.r * backNormal[1]), flip == 1);
            let a2 = angle(int[0], int[1], int[0] - (cur.r * frontNormal[0]), int[1] - (cur.r * frontNormal[1]), flip == 1);
            let usableSegmentPoints = [
                vAdd(cur, vMult(vAngle(a1-pi/2), Math.hypot(cur.x - back.x, cur.y - back.y) - back.filletOffset)), 
                vAdd(cur, vMult(vAngle(a2+pi/2), Math.hypot(cur.x - fwd.x, cur.y - fwd.y) - fwd.filletOffset))
            ];
            let usableLength = Math.min(Math.hypot(usableSegmentPoints[0].x - cur.x, usableSegmentPoints[0].y - cur.y), Math.hypot(usableSegmentPoints[1].x - cur.x, usableSegmentPoints[1].y - cur.y));
            
            let max = null;
            let lineProjection = null;

            if (changeFilletRad) {
                // max point
                let backFull = vAdd(cur, vMult(vAngle(a1-pi/2), usableLength*flip))
                let frontFull = vAdd(cur, vMult(vAngle(a2+pi/2), usableLength*flip))
                max = intersectPointSegments(
                    backFull, vAdd(backFull, backExtension),
                    frontFull, vAdd(frontFull, frontExtension)
                );
                lineProjection = closestPointOnLine(v(t.mx, t.my), cur, v(max));
                cur.r = lineProjection.t
            }

            // actual point
            let backMidp = vAdd(cur, vMult(vAngle(a1-pi/2), usableLength*flip*cur.r)) // factor
            let frontMidp = vAdd(cur, vMult(vAngle(a2+pi/2), usableLength*flip*cur.r))
            let point = intersectPointSegments(
                backMidp, vAdd(backMidp, backExtension),
                frontMidp, vAdd(frontMidp, frontExtension)
            );
            
            let offset = Math.sqrt(distance(cur.x, cur.y, point[0], point[1])**2 - distance(frontMidp.x, frontMidp.y, point[0], point[1])**2)

            return {
                x: point[0],
                y: point[1],
                selected: !changeFilletRad ? null : {
                    max: v(max),
                    mouseProjected: lineProjection
                },
                r: Math.max(distance(frontMidp.x, frontMidp.y, point[0], point[1]), 2),
                angle1: flip > 0 ? a1 : a2,
                angle2: flip > 0 ? a2 : a1,
                flip: flip,
                offset: offset,
                backNormal: backNormal,
                frontNormal: frontNormal,
                backAngle: angle(cur.x, cur.y, back.x, back.y),
                frontAngle: angle(cur.x, cur.y, fwd.x, fwd.y)
            };
        } else {
            return {
                x: cur.x,
                y: cur.y,
                selected: null,
                r: 0,
                angle1: 0,
                angle2: 0,
                flip: 1,
                offset: 0,
                backNormal: backNormal,
                frontNormal: frontNormal,
                backAngle: angle(cur.x, cur.y, back.x, back.y),
                frontAngle: angle(cur.x, cur.y, fwd.x, fwd.y),
                
            };
        }
    }
}

t.currentMode = [t.modeFromIndex(0), Object.keys(t.modes)[0]];
//Object.assign({}, ...t.opKeybinds.map((x, i) => ({[x]: t.ops[i]})));
modeKeybinds = Object.assign({}, ...Object.keys(t.modes).map((key, i) => ({[t.modes[key].keybind]:Object.keys(t.modes)[i]}))) //Object.keys(t.modes).map((x, i)=>({[t.modes[x].keybind]:i}))

window.onkeyup = function(e) {
    if (t.inputEnabled) {
        t.keysDown[e.key] = false;
        t.currentMode = [t.modeFromIndex(0), Object.keys(t.modes)[0]];
        document.body.style.cursor = "default";
    }
}

window.onkeydown = function(e) {
    if (t.inputEnabled) {
        if (e.key == "f")
            e.preventDefault();
        t.keysDown[e.key] = true;
        if (e.key in modeKeybinds && t.currentMode[1] == Object.keys(t.modes)[0]) {
            t.currentMode = [t.modes[modeKeybinds[e.key]], modeKeybinds[e.key]];
            t.currentMode[0].onstart();
        }
    }
}

window.addEventListener("mousedown", e => {
    if (t.inputEnabled) {
        t.currentMode[0].onclick();
    }
});

window.addEventListener("mouseup", e => {
    if (t.inputEnabled) {
        t.click = false;
        t.selected = null;
        t.currentMode[0].onrelease();
    }
});

window.addEventListener("mousemove", e => {
    if (t.inputEnabled) {
        if (t.keysDown.Control) {
            t.mx = Math.round(e.clientX / (t.pixelsPerUnit/8)) * (t.pixelsPerUnit/8);
            t.my = Math.round(e.clientY / (t.pixelsPerUnit/8)) * (t.pixelsPerUnit/8);
        } else {
            t.mx = e.clientX;
            t.my = e.clientY;
        }
        t.click = true;
    }
});

var gridTimes = null
function renderGrid() {
    setBrush("#7cd5f1", 1, .1);
    var first = gridTimes == null;
    if (first)
        gridTimes = []
    for (var y = 0; y < Math.ceil(window.innerHeight/t.pixelsPerUnit); y++) {
        for (var x = 0; x < Math.ceil(window.innerWidth/t.pixelsPerUnit); x++) {
            if (first) {
                if (x == 0)
                    gridTimes.push([]);
                gridTimes[y].push(Math.random()+1);
            }
            ctx.fillRect((x*t.pixelsPerUnit)-1.5, ((y * t.pixelsPerUnit)-1.5) - (100 * easeInBounce(1-Math.min(elapsedTime() * gridTimes[y][x], 1))), 3, 3);
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
    var separatorWidth = 3;
    t.pathString = "";
    var closest = t.closestPointToCoords(t.mx, t.my);
    if (t.selectDistance > closest[1]) {
        t.currentMode[0].onhoverstart(closest[0]);
        rotate(t.path[closest[0]].x, t.path[closest[0]].y, time/2, ()=>{
            setBrush("white", 2, .3);
            var x = Math.sin(time) * 1 + 10
            ctx.strokeRect(-x, -x, x * 2, x * 2)
            setBrush();
        });
    } else { t.currentMode[0].onhoverexit(closest[0]); }
    t.path.forEach((cur, i) => {
        setBrush();
        if (i > 0) {
            var prev = t.path[i - 1];
            if (i < t.path.length - 1) {
                var next = t.path[i + 1];
                cur.fillet = t.fillet(i, t.currentMode[1] == 'fillet' && i == t.selected);

                // Draw the fillet arc
                drawCircle(cur.fillet.x, cur.fillet.y, cur.fillet.r, cur.fillet.angle1, cur.fillet.angle2, () => {
                    setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                    ctx.stroke();
                });
                setBrush()
                p = drawLineFromPoints(next, cur, next.fillet != undefined ? -next.fillet.offset : -1, cur.fillet.offset, null, false)
                drawLineFromPoints(vAdd(v(p[2], p[3]), vMult(v(cur.fillet.frontNormal), -separatorWidth)), vAdd(v(p[2], p[3]), vMult(v(cur.fillet.frontNormal), separatorWidth)))

                p = drawLineFromPoints(prev, cur, prev.fillet != undefined ? -prev.fillet.offset : -1, cur.fillet.offset, null, true, () => {
                    setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                    ctx.stroke();
                });
                setBrush()
                drawLineFromPoints(vAdd(v(p[2], p[3]), vMult(v(cur.fillet.backNormal), -separatorWidth)), vAdd(v(p[2], p[3]), vMult(v(cur.fillet.backNormal), separatorWidth)))
                    
                var textPos = null;
                var filletStartPoint = vAdd(cur, vMult(vAngle(cur.fillet.angle1-pi/2), cur.fillet.offset))
                var filletEndPoint = vAdd(cur, vMult(vAngle(cur.fillet.angle2+pi/2), cur.fillet.offset))
                setBrush("#7cd5f1", 2, .3)
                if (cur.fillet.flip > 0) {
                    drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), -1, prev.fillet ? prev.fillet.offset : 0)
                    drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)), -1, prev.fillet ? prev.fillet.offset : 0)
                    if (i == t.path.length - 2) {
                        drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), )//(t.unitsToPixels(t.robotWidth)/2) - cur.fillet.r)
                        drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)), )//(t.unitsToPixels(t.robotWidth)/2) - cur.fillet.r)
                    }
                }
                else {
                    drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), -1, prev.fillet ? prev.fillet.offset : 0)
                    drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)), -1, prev.fillet ? prev.fillet.offset : 0)
                    if (i == t.path.length - 2) {
                        drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)))
                        drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)))
                    }
                }
                if (cur.fillet.r - t.unitsToPixels(t.robotWidth)/2 > 0) {
                    var a = drawCircle(cur.fillet.x, cur.fillet.y, cur.fillet.r - t.unitsToPixels(t.robotWidth)/2, cur.fillet.angle1, cur.fillet.angle2)
                    textPos = vAdd(vMult(vAngle(cur.fillet.angle1), -t.unitsToPixels(t.robotWidth)/2), v(cur.x, cur.y))
                }else{
                    //console.log(angle(0, 0, cur.fillet.backNormal[0], cur.fillet.backNormal[1]))

                    if (cur.fillet.flip > 0) {
                        //drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(filletStartPoint, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(filletEndPoint, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)))
                        //drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //if (i == t.path.length - 2) {
                        //    drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), )//(t.unitsToPixels(t.robotWidth)/2) - cur.fillet.r)
                        //    drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)), )//(t.unitsToPixels(t.robotWidth)/2) - cur.fillet.r)
                        //}
                        var a = -drawCircle(cur.fillet.x, cur.fillet.y, Math.abs(cur.fillet.r - t.unitsToPixels(t.robotWidth)/2), 
                            angle(0, 0, cur.fillet.backNormal[0], cur.fillet.backNormal[1]) + pi, 
                            angle(0, 0, cur.fillet.frontNormal[0], cur.fillet.frontNormal[1]) + pi
                        )
                    }else {
                        //drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(filletStartPoint, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(filletEndPoint, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), -t.unitsToPixels(t.robotWidth)/2)))
                        //drawLineFromPoints(vAdd(filletEndPoint, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(cur.fillet.backNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //if (i == t.path.length - 2) {
                        //    drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), -t.unitsToPixels(t.robotWidth)/2)))
                        //    drawLineFromPoints(vAdd(filletStartPoint, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(next, vMult(v(cur.fillet.frontNormal), t.unitsToPixels(t.robotWidth)/2)))
                        //}
                        var a = -drawCircle(cur.fillet.x, cur.fillet.y, Math.abs(cur.fillet.r - t.unitsToPixels(t.robotWidth)/2), 
                            angle(0, 0, cur.fillet.frontNormal[0], cur.fillet.frontNormal[1]),
                            angle(0, 0, cur.fillet.backNormal[0], cur.fillet.backNormal[1])
                        )
                    }
                }
                textPos = vAdd(vMult(vAngle(cur.fillet.angle1), t.unitsToPixels(t.robotWidth)/2), v(cur.x, cur.y))
                var b = drawCircle(cur.fillet.x, cur.fillet.y, cur.fillet.r + t.unitsToPixels(t.robotWidth)/2, cur.fillet.angle1, cur.fillet.angle2)


                // Draw line from previous fillet to this 
                setBrush("white", 1, 0.3);
                ctx.setLineDash([5, 5])
                //drawLineFromPoints(next, cur, 0, cur.fillet.offset)
                drawLineFromPoints(prev, cur, 0, cur.fillet.offset)
                ctx.setLineDash([])
                setBrush()
                t.pathString += `f${(Math.hypot(p[0] - p[2], p[1] - p[3])/t.pixelsPerUnit).toFixed(2)} `
                /*
                outsidewheel = v/r * (r + wheelbase/2)
                insidewheel = v/r * (r - wheelbase/2)

                Take the ratio to get the difference in speeds
                outsidewheel/insidewheel=(r + wheelbase/2)/(r - wheelbase/2)

                =(2r + wheelbase)/(2r - wheelbase)
                =(d + wheelbase)/(d - wheelbase)
                */
                if (cur.fillet.r != 0)
                    //t.pathString += `c${((cur.fillet.r.toFixed(3) * cur.fillet.flip)/t.pixelsPerUnit).toFixed(2)}a${Math.abs((cur.fillet.angle1 - cur.fillet.angle2)*180/pi).toFixed(4)} `;
                    t.pathString += `l${(a/t.pixelsPerUnit).toFixed(3)}r${(b/t.pixelsPerUnit).toFixed(3)} `;
            }
            else if (prev.fillet != undefined){
                // last line
                setBrush("white", 1, 0.3);
                ctx.setLineDash([5, 5])
                drawLineFromPoints(prev, cur, -1, -1)
                ctx.setLineDash([])
                setBrush()

                var p = drawLine(prev.x, prev.y, cur.x, cur.y, -prev.fillet.offset, -1, null, true, () => {
                    setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                    ctx.stroke();
                });
                
                t.pathString += `l${(Math.hypot(p[0] - p[2], p[1] - p[3])/t.pixelsPerUnit).toFixed(2)} `
            }
            else {
                // 2 point line
                var p = drawLineFromPoints(prev, cur, 0, 0, null, true, () => {
                    setBrush("#7cd5f1", t.unitsToPixels(t.robotWidth), 0.1);
                    ctx.stroke();
                });
                setBrush("#7cd5f1", 2, .3)
                var backNormal = normal(cur, prev);
                drawLineFromPoints(vAdd(cur, vMult(v(backNormal), -t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(backNormal), -t.unitsToPixels(t.robotWidth)/2)))
                drawLineFromPoints(vAdd(cur, vMult(v(backNormal), t.unitsToPixels(t.robotWidth)/2)), vAdd(prev, vMult(v(backNormal), t.unitsToPixels(t.robotWidth)/2)))
                
                t.pathString += `f${(Math.hypot(p[0] - p[2], p[1] - p[3])/t.pixelsPerUnit).toFixed(2)} `
            }
            var mid = midpoint(p[0], p[1], p[2], p[3])
            drawTri(mid[0], mid[1], 6, 4, angle(p[0], p[1], p[2], p[3])+pi/2)
        }

        setBrush("#fff145");
        rotate(cur.x, cur.y, pi/4, () => {
            ctx.fillRect(-4, -4, 8, 8);
        });
    });
}

function update() {
    setBrush()
    frame += 1;
    time += 0.1%(2*pi)
    ctx.fillStyle = "#161b1e";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = "white";
    ctx.fillText("k's simple paths v0.0.6 | mode: " + t.currentMode[1], 5, 15);

    for (var i = 0; i < t.maps.length; i++) {
        var cur = t.maps[i]
        ctx.globalAlpha = 0.3
        ctx.drawImage(cur.img, cur.x, cur.y, cur.w, cur.h);
        ctx.globalAlpha = 1
    }
    renderGrid();
    t.currentMode[0].render(renderPath);

    if (t.path.length < 2) {
        document.getElementById("path-string").textContent = "PATH STRING: [no path yet!]"
    } else {
        document.getElementById("path-string").textContent = "PATH STRING: " + t.pathString.slice(0, t.pathString.length - 1);
    }
    window.requestAnimationFrame(update);
}