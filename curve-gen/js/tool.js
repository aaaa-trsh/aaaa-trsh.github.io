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
            new Point(200, 300),
            new Point(500, 100),
            new Point(100, 100),
            new Point(400, 300),
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
    static velocities = [];
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

    generatePoints() {
        PointGenTool.points = [];
        PointGenTool.velocities = [];
        for (let i = 0; i < CurveTool.curves.length; i++) {
            let offset = PointGenTool.points.length > 0 ? (this.pointSpacing-Point.dist(
                PointGenTool.points[PointGenTool.points.length - 1],
                CurveTool.curves[i].p0
            )) : 0;
            for (let k = offset; k < CurveTool.curves[i].length; k+=this.pointSpacing) {
                let t = CurveTool.curves[i].mapDistanceToT(k);
                let point = CurveTool.curves[i].getPoint(t);
                PointGenTool.points[PointGenTool.points.length] = point;

                let targetVel = Math.min(this.maxVelocity, this.slowdownCoefficient / (1/CurveTool.curves[i].getCurvature(t).r));
                PointGenTool.velocities[PointGenTool.velocities.length] = targetVel;
            }

            let point = CurveTool.curves[i].getPoint(1);
            PointGenTool.points[PointGenTool.points.length] = point;

            let targetVel = Math.min(this.maxVelocity, this.slowdownCoefficient / (1/CurveTool.curves[i].getCurvature(1).r));
            PointGenTool.velocities[PointGenTool.velocities.length] = targetVel;
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
                let a = PointGenTool.velocities[j] / this.maxVelocity;
                ctx.fillStyle = lerpColor(hexToRgb(yellow), hexToRgb(red), 1-a);

                drawCircle(PointGenTool.points[j], 2*((a)+0.1));
                ctx.fill();
            }
        }
    }
}
// TODO: Refactor states into singletons
class SimulationTool extends Tool{
    static points = [];
    static velocities = [];
    constructor(...args){
        super(...args);
        this.i = 0;
        this.currentCurve = 0;
    }

    move(e) {
        
    }

    click(e) {
        
    }

    start() {
        this.playingSim = false;
        this.playButton = document.getElementById("sim-play-toggle");
        this.playButton.classList.remove("paused");
        this.playButton.classList.add("play");
        
        this.playButton.onclick = () => {
            
            this.playingSim = !this.playingSim;
            if (this.playingSim) {
                // set to paused
                this.playButton.classList.remove("play");
                this.playButton.classList.add("paused");
            } else {
                // set to play
                this.playButton.classList.remove("paused");
                this.playButton.classList.add("play");
            }
            console.log(this.playingSim)
        };
        
        new PointGenTool().start();
    }

    update() {
        ctx.lineWidth = 1;
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
            ctx.fillStyle = "#fff";
            drawCircle(CurveTool.curves[this.currentCurve].getPoint(CurveTool.curves[this.currentCurve].mapDistanceToT(this.i)), 20);
            ctx.fill();
            if (this.playingSim) {
                this.i += 1;
                if (this.i > CurveTool.curves[this.currentCurve].length) {
                    this.i = 0;
                    this.currentCurve = (this.currentCurve + 1) % CurveTool.curves.length;
                }
            }
        }
    }
}