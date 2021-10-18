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
                Point.getAngle(Point.sub(PointGenTool.points[10], PointGenTool.points[0])),
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
            Point.getAngle(Point.sub(PointGenTool.points[10], PointGenTool.points[0])),
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
            ctx.strokeStyle = red;
            ctx.fillStyle = red + "44";
            for (let i = 0; i < PRMTool.polygons.length; i++) {
                PRMTool.polygons[i].draw();
                ctx.fill();
            }
        }
    }
}

class PRMTool extends Tool{
    static polygons = [
        // new Polygon([
        //     new Point(200, 350),
        //     new Point(200, 460),
        //     new Point(710, 460),
        //     new Point(710, 350),
        // ]),
        new Polygon([
            new Point(400, 395),
            new Point(400, 375),
            new Point(510, 375),
            new Point(510, 395),
        ]),
        new Polygon([
            new Point(450, 400),
            new Point(460, 400),
            new Point(460, 475),
            new Point(450, 475),
        ]),
        new Polygon([
            new Point(400, 285),
            new Point(400, 275),
            new Point(510, 275),
            new Point(510, 285),
        ]),
        new Polygon([
            new Point(200, 200),
            new Point(210, 200),
            new Point(210, 475),
            new Point(200, 475),
        ]),
        new Polygon([
            new Point(320, 275),
            new Point(330, 275),
            new Point(330, 475),
            new Point(320, 475),
        ]),
        new Polygon([
            new Point(270, 275),
            new Point(330, 275),
            new Point(330, 285),
            new Point(270, 285),
        ]),
        new Polygon([
            new Point(450, 200),
            new Point(460, 200),
            new Point(460, 275),
            new Point(450, 275),
        ]),
        new Polygon([
            new Point(580, 275),
            new Point(570, 275),
            new Point(570, 475),
            new Point(580, 475),
        ]),
        new Polygon([
            new Point(630, 275),
            new Point(570, 275),
            new Point(570, 285),
            new Point(630, 285),
        ]),
        new Polygon([
            new Point(700, 200),
            new Point(710, 200),
            new Point(710, 475),
            new Point(700, 475),
        ])
    ];
    constructor(...args){
        super(...args);
        
        this.map = [];
        this.points = [];
        this.newPolygon = null;
        this.maxPoints = 0;
        this.path = [];

        this.goalPos = null;
        this.goalPosMap = null;
    }

    closestPointInMap(point, map=this.map) {
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

    closestPoint(point, points) {
        let min = Infinity;
        let pos = new Point(Infinity, Infinity);
    
        for (let i = this.map.length - 1; i >= 0; i--) {
            let abDistance = Point.sub(point, points[i]).len();
            if (abDistance < min) {
                min = abDistance;
                pos = points[i];
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
        this.generateMap();
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
            maxY: maxY,
            inBounds: (point) => {
                return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
            }
        };
    }

    createMapPoint() {

    }
    generateMap() {
        this.map = [];
        this.path = [];
        this.points = [];
        this.polyPoints = [];
        let obstacleEdgePoints = [];
        for (let i = 0; i < PRMTool.polygons.length; i++) {
            for (let j = 0; j < PRMTool.polygons[i].points.length; j++) {
                this.polyPoints.push(PRMTool.polygons[i].points[j]);
            }
            obstacleEdgePoints = obstacleEdgePoints.concat(PRMTool.polygons[i].getOffsetPoints(15));
        }
        let bounds = this.getBoundingBox(this.polyPoints);
        this.bounds = bounds;
        obstacleEdgePoints = obstacleEdgePoints.filter(x => this.bounds.inBounds(x));
        
        // console.log(this.polyPoints.length)
        this.goalPos = new Point(300, 300);

        let p = new PoissonDiskSampling({
            shape: [bounds.maxX - bounds.minX, bounds.maxY - bounds.minY],
            minDistance: this.maxPoints,
            maxDistance: this.maxPoints + 20,
            tries: 10
        });
        let points = p.fill().map(p => new Point(p[0] + bounds.minX, p[1] + bounds.minY));
        this.points = points.concat(obstacleEdgePoints);
        this.points = this.points.filter(p => !PRMTool.polygons.some(poly => new Polygon(poly.getOffsetPoints(8)).pointInside(p)));
        this.points.push(this.goalPos);

        for (let i = 0; i < this.points.length; i++) {
            let a = this.points[i];
            let neighbors = [];
            for (let j = 0; j < this.points.length; j++) {
                let b = this.points[j];

                if (!PRMTool.polygons.some(poly => new Polygon(poly.getOffsetPoints(8)).lineCast(a, b))) {
                    neighbors.push({ p: b, idx: j });
                }
            }
            if (i == 0) this.goalPosMap = {p: a, n: neighbors, idx: i};
            this.map.push({p: a, n: neighbors, idx: i});
        }
    }

    djikstraAlgorithm(start, end, map) {
        let graph = map;
        for (let i = 0; i < graph.length; i++) {
            graph[i].d = Infinity;
            graph[i].visited = false;
        }
        graph[start.idx].d = 0;
        let current = start;
        let maxIterations = graph.length;
        let iterations = 0;
        while (maxIterations > iterations) {
            for (let i = 0; i < current.n.length; i++) {
                let neighbor = graph[current.n[i].idx];
                let d = Point.dist(neighbor.p, current.p) + current.d;
                if (d < neighbor.d) {
                    neighbor.d = d;
                    neighbor.prev = current;
                }
            }
            graph[current.idx].visited = true;

            if (graph[end.idx].visited) {
                break;
            }

            let min = Infinity;
            let minIdx = -1;
            for (let i = 0; i < graph.length; i++) {
                if (!graph[i].visited && graph[i].d < min) {
                    min = graph[i].d;
                    minIdx = i;
                }
            }
            if (minIdx == -1) {
                return [];
            }
            current = graph[minIdx];
            iterations++;
        }
        iterations = 0;

        let path = [];
        current = graph[end.idx];
        while (maxIterations > iterations) {
            path.push(current.p);
            current = current.prev;
            if (current == undefined || current.p.equals(start.p)) break;
            iterations++;
        }
        path.push(start.p);

        // let dist = 0;
        // for (let i = 0; i < path.length; i++) {
        //     if (i > 0) dist += Point.dist(path[i], path[i - 1]);
        //     path[i].d = dist;
        // }

        return path;
    }

    badrandom(seed) {
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }
    
    controlPointsFromPath(path) {
        path = path.reverse();
        const offset = 0.7;
        const maxScaling = 80;
        let controlPoints = [
            path[0],
            Point.add(path[0], Point.sub(path[1], path[0]).normalize())
        ];

        for (let i = 1; i < path.length; i++) {
            if (i < path.length - 1) {
                let a1 = Point.sub(path[i], path[i-1]).getAngle();
                let a2 = Point.sub(path[i+1], path[i]).getAngle();
                let dir = Point.fromAngle(-Math.PI+(a1+a2)/2);
                let dot =  Point.dot(dir, Point.sub(path[i+1], path[i]).normalize());
                let scaling = Math.min(maxScaling, Point.dist(path[i - 1], path[i])*0.75, Point.dist(path[i], path[i+1])*0.75)
                let point = Point.add(
                    path[i],
                    Point.mul(dir, scaling * offset * dot)
                );
                let point2 = Point.add(
                    path[i],
                    Point.mul(dir, scaling * -offset * dot)
                );
                controlPoints.push(point2)
                controlPoints.push(path[i]);
                controlPoints.push(point)
            }
            else {
                controlPoints.push(Point.lerp(path[i-1], path[i], .75));
                controlPoints.push(path[i]);
            }
        }

        // randomly move control points, set them if the velocity is higher then previous generation
        let curves = [];
        for (let i = 0; i < controlPoints.length-1; i+=3) {
            curves.push(new CubicCurve(controlPoints[i], controlPoints[i+1], controlPoints[i+2], controlPoints[i+3]));
        }
        return controlPoints;
    }

    update() {
        // draw bounds
        ctx.strokeRect(this.bounds.minX, this.bounds.minY, this.bounds.maxX - this.bounds.minX, this.bounds.maxY - this.bounds.minY);
        let m = new Point(mx, my);
        if (CurveTool.curves.length > 0) {
            ctx.lineWidth = 1;
            ctx.globalAlpha = .2;
            
            ctx.strokeStyle = lightBlue;
            for (let i = 0; i < CurveTool.curves.length; i++) {
                CurveTool.drawCurve(CurveTool.curves[i], false, false); 
            }
            ctx.globalAlpha = 1;
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = lightBlue + "04";
        this.map.forEach(p => {
            ctx.strokeStyle = lightBlue;
            ctx.fillStyle = lightBlue;
            drawSquare(p.p, 1);
            ctx.fill();
            ctx.strokeStyle = lightBlue + "04";
            p.n.forEach((n) => {
                drawLine(p.p, n.p);
            });
        });
        ctx.lineWidth = 1;
        
        if (keysDown["x"] && this.map.length > 1) {
            ctx.strokeStyle = yellow;
            if (this.map.length > 0) {
                let closestToMouse = this.closestPointInMap(m);
                
                let n = [];
                ctx.lineWidth = 1;
                ctx.strokeStyle = lightBlue + "40";
                if (!PRMTool.polygons.some(poly => poly.pointInside(m))) {
                    for (let i = 0; i < this.map.length; i++) {
                        if (!PRMTool.polygons.some(poly => new Polygon(poly.getOffsetPoints(8)).lineCast(m, this.map[i].p))) {
                            n.push({ p: this.map[i].p, idx: i });
                            drawLine(m, this.map[i].p);
                        }
                    }
                }

                // if (n.length == 0)
                //     n.push( { p: closestToMouse.p, idx: closestToMouse.idx } )
                console.log(n.length)
                let inclusiveMap = [...this.map];
                let mouseNode = { p:m, n: n, idx: this.map.length };
                inclusiveMap.push(mouseNode);
                this.path = this.djikstraAlgorithm(
                    mouseNode,
                    this.closestPointInMap(this.goalPos),
                    inclusiveMap
                );
            }
                
                // this.path = this.generatePath(); 
            drawCircle(this.goalPosMap.p, 2);
            drawCircle(this.goalPos, 2);
            if (this.path.length > 0) {
                ctx.strokeStyle = yellow;
                let test = this.controlPointsFromPath(this.path);
                CurveTool.curves = [];
                for (let i = 0; i < test.length-1; i+=3) {
                    drawBezier(test[i], test[i+1], test[i+2], test[i+3]);
                    drawSquare(test[i], 1)
                    drawSquare(test[i+1], 1)
                    drawSquare(test[i+2], 1)
                    drawSquare(test[i+3], 1)
                    CurveTool.curves.push(new CubicCurve(test[i], test[i+1], test[i+2], test[i+3]));
                }
                
                ctx.strokeStyle = yellow + "33";
                for (let i = 1; i < test.length; i++) {
                    drawLine(test[i - 1], test[i]);
                }
                ctx.strokeStyle = white + "88";

                for (let i = 1; i < this.path.length; i++) {
                    drawLine(this.path[i - 1], this.path[i]);
                }
            }
        }
        
        ctx.strokeStyle = red;
        ctx.fillStyle = red + "44";
// this is line 747 and gowdham typed this at 8:09 on 9/9/21
        for (let i = 0; i < PRMTool.polygons.length; i++) {
            PRMTool.polygons[i].draw();
            ctx.fill();
        }

        if (this.newPolygon != null && this.newPolygon.points.length > 0) {
            this.newPolygon.draw();
        }

    
        if (this.bounds.inBounds(m)) {
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
                    PRMTool.polygons.push(this.newPolygon);
                }
                this.newPolygon = null;
            }
        }
    }
}