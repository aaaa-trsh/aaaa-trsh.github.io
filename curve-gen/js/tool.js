class Tool {
    constructor() {
    }

    click(e) {}
    unclick(e) {}
    move(e) {}
    move(e) {}
    start() {}
    end() {}
}

class CurveTool extends Tool{
    static curves = [
        new CubicCurve(
            new Point(100, 200),
            new Point(400, 200),
            new Point(100, 500),
            new Point(400, 500),
        )
    ];
    constructor(...args){
        super(...args);
        this.newCurvePoints = [];
        this.handleOffsets = [];
    }

    getAllHandles() {
        let handles = [];
        CurveTool.curves.forEach((curve, i) => {
            handles.push(
                {cid:i, p: curve.p0, orbit: null},
                {cid:i, p: curve.p1, orbit: curve.p0},
                {cid:i, p: curve.p2, orbit: curve.p3},
                {cid:i, p: curve.p3, orbit: null},
            );
        });
        return handles;
    }

    getOtherOrbitingHandle(handle) {
        let handles = this.getAllHandles();
        let retval = handles.filter(h => (h != handle && h.cid != handle.cid && h.orbit == handle.orbit));
        return retval.length > 0 ? retval[0] : null;
    }

    getOrbitingHandles(handle) {
        let handles = this.getAllHandles();
        let retval = handles.filter(h => (h != handle && h.orbit == handle.p));
        return retval;
    }

    selectableHandle() {
        let handles = this.getAllHandles();
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

    move(e) {
        if (!keysDown.Shift) {
            let sHandle = this.selectableHandle();
            if (sHandle != null && clicking) {
                sHandle.p.x = mx;
                sHandle.p.y = my;

                if (sHandle.orbit != null) {
                    let other = this.getOtherOrbitingHandle(sHandle);
                    if (other != null) {
                        other.p.x = -(sHandle.p.x - other.orbit.x) + sHandle.orbit.x;
                        other.p.y = -(sHandle.p.y - other.orbit.y) + sHandle.orbit.y;
                    }
                } else {
                    let orbiting = this.getOrbitingHandles(sHandle);
                    // console.log(orbiting);
                    orbiting.forEach((h, i) => {
                        h.p.x = this.handleOffsets[i].x + sHandle.p.x;
                        h.p.y = this.handleOffsets[i].y + sHandle.p.y;
                    });
                }
            }
        }
    }
    click(e) {
        if (keysDown.Shift) {
            this.newCurvePoints.push(new Point(mx, my));

            if (this.newCurvePoints.length == 4) {
                CurveTool.curves.push(
                    new CubicCurve(
                        this.newCurvePoints[0], 
                        this.newCurvePoints[1],
                        this.newCurvePoints[2], 
                        this.newCurvePoints[3]
                    )
                );
                let prevCurve = CurveTool.curves[CurveTool.curves.length - 1];
                this.newCurvePoints = [
                    prevCurve.p3, 
                    Point.add(prevCurve.p3, Point.sub(prevCurve.p3, prevCurve.p2))
                ];
            }
        } else {
            let sHandle = this.selectableHandle();
            this.handleOffsets = [];
            if (sHandle != null && sHandle.orbit == null) {    
                let orbiting = this.getOrbitingHandles(sHandle);
                orbiting.forEach(h => {
                    this.handleOffsets.push(Point.sub(h.p, sHandle.p));
                });
            }
        }
    }

    static drawCurve(curve, drawArrows=true, drawDebug=false) {
        const samples = 25;
        let style = ctx.strokeStyle;
        
        if (drawDebug) {
            ctx.lineWidth = 3;
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 1; i < samples; i+= 2) {
                ctx.globalAlpha = .01;

                ctx.strokeStyle = lightBlue;
                let curvature = curve.getCurvature(i / samples);
                drawCircle(
                    new Point(curvature.x, curvature.y),
                    Math.abs(curvature.r)
                )
                ctx.globalAlpha = 1;
                ctx.strokeStyle = style;
            }
            ctx.lineWidth = 1;
            ctx.globalCompositeOperation = 'source-over';
        }
        for (let i = 1; i <= samples; i++) {
            const p = curve.getPoint(i / samples);
            const prev = curve.getPoint((i - 1) / samples);
            drawLine(p, prev);

            if (drawArrows && i < samples && i%3 == 0) {
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
        }
    }

    update() {        
        // previs
        if(keysDown.Shift && this.newCurvePoints.length > 0) {
            let mousePoint = new Point(mx, my);
            let preVisCurve = new CubicCurve(
                this.newCurvePoints[0],
                this.newCurvePoints.length > 1 ? this.newCurvePoints[1] : mousePoint,
                this.newCurvePoints.length > 2 ? this.newCurvePoints[2] : mousePoint,
                this.newCurvePoints.length > 3 ? this.newCurvePoints[3] : mousePoint
            )
            ctx.strokeStyle = darkBlue;
            ctx.lineWidth = 2;
            CurveTool.drawCurve(preVisCurve, true);
            
            ctx.lineWidth = 1;
            ctx.strokeStyle = white;
        }

        // draw curves
        ctx.lineWidth = 1;
        for (let i = 0; i < CurveTool.curves.length; i++) {
            ctx.strokeStyle = yellow;
            CurveTool.drawCurve(CurveTool.curves[i], true); 
        }

        // draw handles
        let handles = this.getAllHandles();
        let closest = this.selectableHandle();
        for (let i = 0; i < handles.length; i++) {
            if (i < handles.length - 1 && (handles[i].orbit == null || handles[i + 1].orbit == null)) {
                ctx.strokeStyle = darkBlue;
                drawLine(handles[i].p, handles[i+1].p);
                ctx.strokeStyle = white;
            }

            if (closest != null && closest.p == handles[i].p) ctx.lineWidth = 3;
            else ctx.lineWidth = 1;

            if(handles[i].orbit != null)
                ctx.strokeStyle = lightBlue;
            else {
                ctx.strokeStyle = white;
                ctx.lineWidth += 2;
            }
            
            drawCircle(handles[i].p, closest == handles[i] ? 4 : 5);
            ctx.strokeStyle = white;
            ctx.lineWidth = 1;
        }

        // reset new points when not adding
        if (!keysDown.Shift && CurveTool.curves.length > 0) {
            let lastCurve = CurveTool.curves[CurveTool.curves.length - 1];
            this.newCurvePoints = [
                lastCurve.p3, 
                Point.add(lastCurve.p3, Point.sub(lastCurve.p3, lastCurve.p2))
            ];
        }
    }
}

class PointGenTool extends Tool{
    static points = [];
    constructor(...args){
        super(...args);
        this.i = 0;
    }

    move(e) {
        
    }

    click(e) {
        
    }

    start() {
        this.spacingInput = document.getElementById("point-spacing-input");
        this.maxVelocityInput = document.getElementById("point-maxvel-input");
        this.maxAccelerationInput = document.getElementById("point-maxaccel-input");
        this.slowdownCoefficientInput = document.getElementById("point-slo-input");
        let inputs = [
            this.spacingInput,
            this.maxVelocityInput,
            this.maxAccelerationInput,
            this.slowdownCoefficientInput
        ]

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener("input", () => {
                this.updateInputs();
            });
        }
        
        this.updateInputs();
    }

    updateInputs() {
        this.maxVelocity = parseFloat(this.maxVelocityInput.value) * 100;
        this.maxAcceleration = parseFloat(this.maxAccelerationInput.value) * 100;
        this.slowdownCoefficient = parseInt(this.slowdownCoefficientInput.value, 10);

        this.pointSpacing = parseInt(this.spacingInput.value, 10);
        this.generatePoints();

    }

    static getNearestPoint(p) {
        let nearest = PointGenTool.points[0];
        for (let i = 0; i < PointGenTool.points.length; i++) {
            if (Point.dist(nearest, p) > Point.dist(PointGenTool.points[i], p)) {
                nearest = PointGenTool.points[i];
            }
        }

        return nearest;
    }

    generatePoints() {
        PointGenTool.points = [];
        for (let i = 0; i < CurveTool.curves.length; i++) {
            let offset = PointGenTool.points.length > 0 ? (this.pointSpacing-Point.dist(
                PointGenTool.points[PointGenTool.points.length - 1],
                CurveTool.curves[i].p0
            )) : 0;
            for (let k = offset; k < CurveTool.curves[i].length; k+=this.pointSpacing) {
                let t = CurveTool.curves[i].mapDistanceToT(k);
                let point = CurveTool.curves[i].getPoint(t);
                let targetVel = Math.min(this.maxVelocity, this.slowdownCoefficient / (1/CurveTool.curves[i].getCurvature(t).r));
                PointGenTool.points[PointGenTool.points.length] = PathPoint.fromPoint(point, targetVel);

            }

            let point = CurveTool.curves[i].getPoint(1);
            let targetVel = Math.min(this.maxVelocity, this.slowdownCoefficient / (1/CurveTool.curves[i].getCurvature(1).r));
            PointGenTool.points[PointGenTool.points.length] = PathPoint.fromPoint(point, targetVel);
        }
    }
    
    lerp(a, b, amt)
    {
        return (b - a) * amt + a;
    }

    lerpColor(c1, c2, a) {
        return `rgb(${this.lerp(c1.r, c2.r, a)}, ${this.lerp(c1.g, c2.g, a)}, ${this.lerp(c1.b, c2.b, a)})`;
    }
    
    update() {
        ctx.fillStyle = yellow;
        ctx.lineWidth = 1;
        if (CurveTool.curves.length > 0) {
            this.i = (this.i + 10) % CurveTool.curves[0].length; 

            ctx.lineWidth = 3;
            ctx.globalAlpha = .2;

            ctx.strokeStyle = lightBlue;
            for (let i = 0; i < CurveTool.curves.length; i++) {
                CurveTool.drawCurve(CurveTool.curves[i], false, false); 
            }

            ctx.strokeStyle = clear;
            ctx.globalAlpha = 1;
            for (let j = 0; j < PointGenTool.points.length; j++) {
                let a = PointGenTool.points[j].vel / this.maxVelocity;
                ctx.fillStyle = lerpColor(hexToRgb(yellow), hexToRgb(red), 1-a);

                drawCircle(PointGenTool.points[j], 2*((a)+0.1));
                ctx.fill();
            }
        }
    }
}
// TODO: Refactor states into singletons
class SimulationTool extends Tool{
    constructor(...args){
        super(...args);
    }

    move(e) {
        
    }

    click(e) {
        if (keysDown.Shift) {
            this.robot = new PurePursuitRobot(
                new Point(mx, my),
                Point.getAngle(Point.sub(PointGenTool.points[1], PointGenTool.points[0])),
                20,
                PointGenTool.points,
                10
            );
            this.setStopped(true);
        }
    }

    start() {
        this.playButton = document.getElementById("sim-play-toggle");
        this.resetButton = document.getElementById("sim-reset-button");
        this.ldInput = document.getElementById("sim-ld-input");

        this.playButton.classList.remove("paused");
        this.playButton.classList.add("play");
        
        new PointGenTool().start();
        this.robot = new PurePursuitRobot(
            PointGenTool.points[0],
            Point.getAngle(Point.sub(PointGenTool.points[1], PointGenTool.points[0])),
            20,
            PointGenTool.points,
            10
        );
        
        this.robot.stopped = true;
        this.playButton.onclick = () => {
            this.setStopped(!this.robot.stopped);
        };

        this.resetButton.onclick = () => {
            console.log("reset")
            this.robot = new PurePursuitRobot(
                PointGenTool.points[0],
                Point.getAngle(Point.sub(PointGenTool.points[1], PointGenTool.points[0])),
                20,
                PointGenTool.points,
                10
            );
            this.setStopped(true);
        };
    }

    setStopped(stopped) {
        if (stopped) {
            this.playButton.classList.remove("paused");
            this.playButton.classList.add("play");
            this.robot.stopped = true;
        } else {
            this.playButton.classList.remove("play");
            this.playButton.classList.add("paused");
            this.robot.stopped = false;
        }
    }

    sign(x) {
        return x == 0 ? 1 : Math.sign(x);
    }

    
    update() {
        this.robot.lookaheadDistance = parseInt(this.ldInput.value);
        // this.robot = new PurePursuitRobot(mx, my, 0, PointGenTool.points, 20);
        if (CurveTool.curves.length > 0) {
            ctx.lineWidth = 1;
            ctx.globalAlpha = .2;
            
            ctx.strokeStyle = lightBlue;
            for (let i = 0; i < CurveTool.curves.length; i++) {
                CurveTool.drawCurve(CurveTool.curves[i], false, false); 
            }
            ctx.strokeStyle = clear;
            ctx.fillStyle = lightBlue + "44";
            
            ctx.globalAlpha = 1;
            for (let j = 0; j < PointGenTool.points.length; j++) {
                drawCircle(PointGenTool.points[j], 2);
                ctx.fill();
            }
            
            // drawCircle(Point.add(this.robot.getPoint(), Point.mul(Point.fromAngle(this.robot.angle+Math.PI*1.5), 10)), 2);
            // drawCircle(Point.add(this.robot.getPoint(), Point.mul(Point.fromAngle(this.robot.angle+Math.PI*.5), 10)), 2);

            // this.robot.tankDrive(lspeed, rspeed);
            
            this.robot.execute();
        }
    }
}

class PRMTool extends Tool{
    constructor(...args){
        super(...args);
        this.polygons = [];
        this.map = [];
        this.points = [];
        this.newPolygon = null;
        this.maxPoints = 0;
        this.path = [];

        this.goalPos = null;
        this.goalPosMap = null;
    }

    closestPoint(point) {
        let min = Infinity;
        let pos = new Point(Infinity, Infinity);
    
        for (let i = this.map.length - 1; i >= 0; i--) {
            let abDistance = Point.sub(point, this.map[i].p).len();
            if (abDistance < min) {
                min = abDistance;
                pos = this.map[i];
            }
        }
        return pos;
    }


    move(e) {
        
    }

    click(e) {
        if (keysDown.Shift) {
            this.newPolygon.points.push(new Point(mx, my));
        }
    }

    start() {
        this.genButton = document.getElementById("prm-gen-button");
        this.maxPointsInput = document.getElementById("prm-maxpoints-input");
        this.maxPoints = parseInt(this.maxPointsInput.value);
        this.maxPointsInput.onchange = () => {
            this.maxPoints = parseInt(this.maxPointsInput.value);
        }

        this.genButton.onclick = () => {
            this.generateMap();
        }
    }

    getBoundingBox(points) {
        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = points[0].x;
        let maxY = points[0].y;
        for (let i = 1; i < points.length; i++) {
            if (points[i].x < minX) minX = points[i].x;
            if (points[i].y < minY) minY = points[i].y;
            if (points[i].x > maxX) maxX = points[i].x;
            if (points[i].y > maxY) maxY = points[i].y;
        }
        return {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY
        };
    }

    generateMap() {
        this.map = [];
        this.path = [];
        this.points = [];
        this.polyPoints = [];
        for (let i = 0; i < this.polygons.length; i++) {
            for (let j = 0; j < this.polygons[i].points.length; j++) {
                this.polyPoints.push(this.polygons[i].points[j]);
            }
        }

        console.log(this.polyPoints.length)
        let bounds = this.getBoundingBox(this.polyPoints);
        this.goalPos = new Point((bounds.maxX + bounds.minX)/2, (bounds.maxY + bounds.minY)/2);
        this.points.push(this.goalPos);
        for (let i = 0; i < this.maxPoints; i++) {
            let p = new Point(
                Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
                Math.random() * (bounds.maxY - bounds.minY) + bounds.minY
            );
            let inPoly = false;
            for (let j = 0; j < this.polygons.length; j++) {
                // if (Point.dist(p, this.polygons[j]) > 500) continue;
                if (this.polygons[j].pointInsideOffset(p, 10)) {
                    inPoly = true;
                    break;
                }
            }
            if (!inPoly) {
                this.points.push(p);
            } else {
                i--;
            }
        }

        // for (let i = 0; i < allPoints.length; i++) {}
        for (let i = 0; i < this.points.length; i++) {
            let a = this.points[i];
            let neighbors = [];
            for (let j = 0; j < this.points.length; j++) {
                let b = this.points[j];
                let inPoly = false;
                for (let k = 0; k < this.polygons.length; k++) {
                    if (this.polygons[k].rayCast(a, Point.sub(b, a).normalize())) {
                        inPoly = true;
                    }
                }
                if (!inPoly) {
                    neighbors.push({ p: b, idx: j });
                }
            }
            neighbors.sort(p => Point.dist(a, p));
            if (i == 0) this.goalPosMap = {p: a, n: neighbors, idx: i};
            this.map.push({p: a, n: neighbors, idx: i});
        }
    }


    shortestPath(a, b) {
        let open = [];
        let closed = [];
        const MAX = 1000;
        let count = 0;
        open.push({a:a, parent:null});
        while (open.length > 0 && MAX> count) {
            let cur = open.shift();
            closed.push(cur);
            for (let i = 0; i < cur.a.n.length; i++) {
                let neighbor = cur.a.n[i];
                if (neighbor.p.equals(b.p)) {
                    let path = []
                    path.push(neighbor.p);
                    path.push(cur.a.p);
                    while (cur.parent != null) {
                        path.push(cur.parent.a.p);
                        cur = cur.parent;
                    }
                    console.log(path)
                    return path;
                }
                if (!closed.includes(this.map[neighbor.idx])) {
                    open.push({a:this.map[neighbor.idx], parent:cur});
                }
            }
            count ++;
        }
        return [];
    }

    sign(x) {

    }

    isPointObstructed(point) {
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].pointInside(point)) {
                return true;
            }
        }
        return false;
    }
    
    update() {
        let m = new Point(mx, my);
        if (CurveTool.curves.length > 0) {
            ctx.lineWidth = 1;
            ctx.globalAlpha = .2;
            
            ctx.strokeStyle = lightBlue;
            for (let i = 0; i < CurveTool.curves.length; i++) {
                CurveTool.drawCurve(CurveTool.curves[i], false, false); 
            }
            ctx.strokeStyle = clear;
            ctx.fillStyle = lightBlue + "44";
            
            ctx.globalAlpha = 1;
            for (let j = 0; j < PointGenTool.points.length; j++) {
                drawCircle(PointGenTool.points[j], 2);
                ctx.fill();
            }
        }

        ctx.lineWidth = 0.7;
        ctx.strokeStyle = lightBlue + "01";
        this.map.forEach(p => {
            // ctx.strokeStyle = yellow;
            // ctx.fillStyle = yellow;
            // drawSquare(p.p, 1);
            // ctx.fill();
            p.n.forEach(n => {
                drawLine(p.p, n.p);
            });
        });
        ctx.lineWidth = 1;
        

        
        if (keysDown["x"]) {
            ctx.strokeStyle = yellow;
            if (this.map.length > 0)
                this.path = this.shortestPath({ p:m, n: [ this.closestPoint(m) ] }, this.goalPosMap); 
            drawCircle(this.goalPosMap.p, 2);
            drawCircle(this.goalPos, 2);
            if (this.path.length > 0) {
                // drawCircle(this.path[0], 2);
                // drawCircle(this.path[this.path.length - 1], 2);
                ctx.strokeStyle = yellow + "88";

                for (let i = 0; i < this.path.length - 1; i++) {
                    drawLine(this.path[i], this.path[i + 1]);
                }
            }
        }
        
        ctx.strokeStyle = red;
        ctx.fillStyle = red + "44";

        for (let i = 0; i < this.polygons.length; i++) {
            this.polygons[i].draw();
            ctx.fill();
        }

        if (this.newPolygon != null && this.newPolygon.points.length > 0) {
            this.newPolygon.draw();
        }

        let int = false;
        for (let i = 0; i < this.polygons.length; i++) {
            if (this.polygons[i].rayCast(new Point(mx, my), new Point(0, 1)) && !int) {
                int = true;
                break
            }
        }

        if (int) {//this.isPointObstructed(m)) {
            ctx.strokeStyle = red;
            ctx.fillStyle = red + "44";
        } else {
            ctx.strokeStyle = yellow;
            ctx.fillStyle = clear;
        }
        drawCircle(m, 5);
        ctx.fill();


        if (keysDown.Shift) {
            document.body.style.cursor = "crosshair";
            if (this.newPolygon == null)
                this.newPolygon = new Polygon([]);
        } else {
            document.body.style.cursor = "default";
            if (this.newPolygon != null) {
                if (this.newPolygon.points.length > 2) {
                    this.newPolygon.points = this.newPolygon.convexHull();
                    this.polygons.push(this.newPolygon);
                }
                this.newPolygon = null;
            }
        }
    }
}