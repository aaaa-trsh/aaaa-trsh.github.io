class DifferentialDriveRobot {
    constructor (pos, angle, trackwidth) {
        this.pos = pos;
        this.angle = angle;
        this.trackwidth = trackwidth;
    }

    getICC(l, r) {
        let R = (this.trackwidth / 2) * (l + r) / (l - r);
        let icc = new Point(this.pos.x - R * Math.sin(this.angle), this.pos.y + R * Math.cos(this.angle));
        return { p: icc, r: R };
    }

    tankDrive(l, r) {
        let icc = this.getICC(l, r);
        let w = (l - r) / this.trackwidth;

        if (w != 0) {
            this.pos = Point.add(Point.sub(this.pos, icc.p).rotate(w), icc.p);
            this.angle += w;
        }
        else {
            this.pos = Point.add(this.pos, Point.fromAngle(this.angle));
        }
    }
}

class PurePursuitRobot extends DifferentialDriveRobot {
    constructor (pos, angle, trackwidth, path, lookaheadDistance) {
        super(pos, angle, trackwidth);
        this.path = path;
        this.lookaheadDistance = lookaheadDistance;
        this.lookaheadPoint = this.projectToPath(this.pos);
        this.prevPos = this.pos;
        this.stopped = false;
        this.points = [];
        this.points.push(this.pos);
    }

    sign(x) { return x == 0 ? 1 : Math.sign(x); }
    
    closestPoint(point) {
        let min = Infinity;
        let pos = new Point(Infinity, Infinity);
    
        for (let i = this.path.length - 1; i >= 0; i--) {
            let abDistance = Point.sub(point, this.path[i]).len();
            if (abDistance < min) {
                min = abDistance;
                pos = this.path[i];
            }
        }
        return pos;
    }

    projectToPath(point) {
        let min = Infinity;
        let b = new Point(Infinity, Infinity);
        let idx = 0;

        for (let i = this.path.length - 1; i > 0; i--) {
            let abDistance = Point.sub(point, this.path[i]).len();
            if (abDistance < min) {
                min = abDistance;
                b = this.path[i];
                idx = i;
            }
        }

        let a = this.path[idx - 1];
        let ab = Point.sub(b, a);
        let ap = Point.sub(point, a);
        let dot = Point.dot(ap, ab);
        let dist = dot / (ab.len() * ab.len());

        if (dist <= 0)    
            return {p: a, i: idx-1};
        else if (dist >= 1)
            return {p: b, i: idx};
        else
            return {p: Point.add(a, Point.mul(ab, dist)), i: idx + dist};
    }
    
    getLookaheadPoint(p, r) {
        let lookaheadProposals = [];

        for (var i = 0; i < this.path.length - 1; i++) {
            let segmentStart = this.path[i];
            let segmentEnd = this.path[i + 1];

            let p1 = new Point(segmentStart.x - p.x, segmentStart.y - p.y);
            let p2 = new Point(segmentEnd.x - p.x, segmentEnd.y - p.y);

            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            let D = p1.x * p2.y - p2.x * p1.y;

            let discriminant = r * r * d * d - D * D;
            if (discriminant < 0 || p1.equals(p2)) continue;

            let x1 = (D * dy + this.sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);
            let x2 = (D * dy - this.sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);

            let y1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);
            let y2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);

            let validIntersection1 = Math.min(p1.x, p2.x) < x1 && x1 < Math.max(p1.x, p2.x)
                || Math.min(p1.y, p2.y) < y1 && y1 < Math.max(p1.y, p2.y);
                let validIntersection2 = Math.min(p1.x, p2.x) < x2 && x2 < Math.max(p1.x, p2.x)
                || Math.min(p1.y, p2.y) < y2 && y2 < Math.max(p1.y, p2.y);

            //if (validIntersection1 || validIntersection2) lookahead = null;

            if (validIntersection1) {
                lookaheadProposals.push(new Point(x1 + p.x, y1 + p.y));
            }

            if (validIntersection2) {
                // if (lookahead == null || Math.abs(x1 - p2.x) > Math.abs(x2 - p2.x) || Math.abs(y1 - p2.y) > Math.abs(y2 - p2.y)) {
                    lookaheadProposals.push(new Point(x2 + p.x, y2 + p.y));
                // }
            }
        }
        let robotProj = this.projectToPath(this.pos);
        lookaheadProposals.forEach(p => {
            drawCircle(p, 2);
        })
        console.log(lookaheadProposals.length)
        lookaheadProposals = lookaheadProposals
            .map(x => this.projectToPath(x))
            .filter(x => x.i > robotProj.i)
            .sort((x, y) => (x.i - robotProj.i)*(x.i - robotProj.i) - (y.i - robotProj.i)*(y.i - robotProj.i));

        return lookaheadProposals.length > 0 ? lookaheadProposals[0] : this.lookaheadPoint;
    }

    linePointProject(a, b, p) {
        var slope = (a.y - b.y) / (a.x - b.x);
        var yint = a.y - slope * a.x;

        var slope2 = -1 / slope;
        var yint2 = p.y - slope2 * p.x;
        var nx = (yint2 - yint) / (slope - slope2);
        return new Point(nx, (slope * nx) + yint);
    }

    targetToProportional(targetVel, targetAcceleration) {
        let p = 1;
        let v = 1;
        let a = 1;
        let feedForward = (v * targetVel) + (a * targetAcceleration);
        let feedBack = p * (targetVel - Point.sub(this.pos, this.prevPos).len());
        // console.log("feedForward: ", feedForward, "  feedBack: ", feedBack, targetAcceleration)
        return feedForward + feedBack;
    }

    execute() {
        let lVel = 0;
        let rVel = 0;
        let closest = this.projectToPath(this.pos);
        if (closest.i > this.path.length-2) { this.stopped = true; }
        if (!this.stopped) {
            let closestState = new TrajectoryState(closest.p.x, closest.p.y, 0, 2, 0);
            this.lookaheadPoint = this.getLookaheadPoint(this.pos, this.lookaheadDistance);

            let b = Point.add(this.pos, Point.fromAngle(this.angle)); // a point on the robot line
            let l = Point.dist(this.pos, this.lookaheadPoint.p); // distance from lookahead point to rbot pos
            let x = Point.dist(this.linePointProject(this.pos, b, this.lookaheadPoint.p), this.lookaheadPoint.p); // horizontal distance (relative to rbot) to lookahead point
            
            ctx.strokeStyle = red;
            drawCircle(this.linePointProject(this.pos, b, this.lookaheadPoint.p), 1);
            ctx.strokeStyle = yellow;

            // let side = this.sign(Point.cross(Point.fromAngle(this.angle), Point.sub(this.lookaheadPoint, this.pos).normalize())); // side of robot line to lookahead point
            let side = this.sign((b.y - this.pos.y) * (this.lookaheadPoint.p.x - this.pos.x) - (b.x - this.pos.x) * (this.lookaheadPoint.p.y - this.pos.y))
            let k = (2 * x * -side) / (l * l); // signed curvature

            let targetLeftVel = closestState.v * (2 + k * this.trackwidth) / 2;
            let targetRightVel = closestState.v * (2 - k * this.trackwidth) / 2;
            // console.log(Math.min(targetLeftVel, targetRightVel), Math.max(targetLeftVel, targetRightVel))
            console.log(targetLeftVel / Math.max(targetLeftVel, targetRightVel), targetRightVel / Math.max(targetLeftVel, targetRightVel))
            lVel = this.targetToProportional(targetLeftVel, closestState.a) // Math.min(Math.abs(targetLeftVel), 1) * this.sign(targetLeftVel)
            rVel = this.targetToProportional(targetRightVel, closestState.a) // Math.min(Math.abs(targetRightVel), 1) * this.sign(targetLeftVel)
            this.tankDrive(
                lVel,
                rVel
            );
            
            this.prevPos = this.pos;
            this.points.push(this.pos);
        }

        ctx.strokeStyle = lightBlue;
        let icc = this.getICC(
            lVel,
            rVel
        )
        ctx.globalAlpha = .3;
        drawCircle(icc.p, Math.abs(icc.r));
        drawCircle(this.pos, this.lookaheadDistance);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = yellow;
        ctx.strokeStyle = yellow;
        drawCircle(icc.p, 2);
        drawCircle(this.lookaheadPoint.p, 2);
        
        drawCircle(this.pos, 5);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        this.points.forEach(p => {
            ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.closePath();
        

        ctx.strokeStyle = yellow;
        drawRay(
            Point.add(this.pos, Point.mul(Point.fromAngle(this.angle+Math.PI*1.5), 10)), 
            this.angle,
            lVel * 10
        );
        drawRay(
            Point.add(this.pos, Point.mul(Point.fromAngle(this.angle+Math.PI*.5), 10)), 
            this.angle,
            rVel * 10
        );

        drawLine(this.pos, Point.add(this.pos, Point.mul(Point.fromAngle(this.angle), 20)));
    }
}
class PurePursuitRobotBeta extends Point {
    constructor (x, y, angle, path, lookaheadDist) {
        super(x, y);
        this.angle = angle;
        this.path = path;
        this.lookaheadDist = lookaheadDist;
        this.lastLookahead = null;
        this.speed = 0;

        this.robotPose = this.getPoint();
        this.prevRobotPose = this.getPoint();

        this.l = this.path[0];
    }
    getPoint() {
        return new Point(this.x, this.y)
    }
    sign(x) {
        return x == 0 ? 1 : Math.sign(x);
    }
    
    closestPoint(point) {
        let closestDistance = Infinity;
        let closestPos = new Point(Infinity, Infinity);
    
        for (let i = this.path.length - 1; i >= 0; i--) {
            let abDistance = Point.sub(point, this.path[i]).len();
            if (abDistance < closestDistance) {
                closestDistance = abDistance;
                closestPos = this.path[i];
            }
        }
        return closestPos;
    }

    projectToPath(point) {
        let closestDistance = Infinity;
        let b = new Point(Infinity, Infinity);
        let idx = 0;

        for (let i = this.path.length - 1; i > 0; i--) {
            let abDistance = Point.sub(point, this.path[i]).len();
            if (abDistance < closestDistance) {
                closestDistance = abDistance;
                b = this.path[i];
                idx = i;
            }
        }

        let a = this.path[idx - 1];

        let ab = Point.sub(b, a);
        let ap = Point.sub(point, a);
        let dot = Point.dot(ap, ab);
        let dist = dot / (ab.len() * ab.len());
        if (dist < 0)     //Check if P projection is over vectorAB     
            return {p: a, i: idx-1};
        else if (dist > 1)
            return {p: b, i: idx};
        else
            return {p: Point.add(a, Point.mul(ab, dist)), i: idx + dist};
    }
    
    getLookaheadPoint(x, y, r) {
        let lookaheadProposals = [];

        for (var i = 0; i < this.path.length - 1; i++) {
            let segmentStart = this.path[i];
            let segmentEnd = this.path[i + 1];

            let p1 = new Point(segmentStart.x - x, segmentStart.y - y);
            let p2 = new Point(segmentEnd.x - x, segmentEnd.y - y);

            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            let D = p1.x * p2.y - p2.x * p1.y;

            let discriminant = r * r * d * d - D * D;
            if (discriminant < 0 || p1.equals(p2)) continue;

            let x1 = (D * dy + this.sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);
            let x2 = (D * dy - this.sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);

            let y1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);
            let y2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);

            let validIntersection1 = Math.min(p1.x, p2.x) < x1 && x1 < Math.max(p1.x, p2.x)
                || Math.min(p1.y, p2.y) < y1 && y1 < Math.max(p1.y, p2.y);
                let validIntersection2 = Math.min(p1.x, p2.x) < x2 && x2 < Math.max(p1.x, p2.x)
                || Math.min(p1.y, p2.y) < y2 && y2 < Math.max(p1.y, p2.y);

            //if (validIntersection1 || validIntersection2) lookahead = null;

            if (validIntersection1) {
                lookaheadProposals.push(new Point(x1 + x, y1 + y));
            }

            if (validIntersection2) {
                // if (lookahead == null || Math.abs(x1 - p2.x) > Math.abs(x2 - p2.x) || Math.abs(y1 - p2.y) > Math.abs(y2 - p2.y)) {
                    lookaheadProposals.push(new Point(x2 + x, y2 + y));
                // }
            }
        }
        let robotProj = this.projectToPath(this.getPoint());
        lookaheadProposals = lookaheadProposals
            .map(x => this.projectToPath(x))
            .filter(x => x.i > robotProj.i)
            .sort((x, y) => (x.i - robotProj.i)*(x.i - robotProj.i) - (y.i - robotProj.i)*(y.i - robotProj.i));
        return lookaheadProposals.length > 0 ? lookaheadProposals[0].p : this.l;
    }

    update() {
        ctx.fillStyle = yellow;
        ctx.strokeStyle = yellow;

        this.l = this.getLookaheadPoint(this.x, this.y, this.lookaheadDist);
        let ld = Point.dist(this.getPoint(), this.l);
        let a = Point.angleTo(this.getPoint(), this.l);
        let k = (2 * Math.sin(a)) / ld;
        let steering = Math.atan((2 * Math.sin(a)) / ld);

        drawCircle(this.l, 2)
        drawCircle(Point.get2PointRadCenter(this.getPoint(), this.l, 1 / k)[this.sign(steering) == 1 ? 0 : 1], Math.abs(1/k))
        drawCircle(this.getPoint(), 2)
        ctx.fill();
        

        ctx.font = "10px sans-serif";
        ctx.fillText(steering + "", this.x, this.y - 10);
        
        let newPos = Point.mul(Point.fromAngle(this.angle), 2);
        drawLine(this.getPoint(), Point.add(this.getPoint(), Point.mul(Point.fromAngle(this.angle), 10)))
        this.x += newPos.x;
        this.y += newPos.y;
        this.angle += steering;
        // let x = Math.abs(-Math.tan(this.robot.angle)*lh.x + lh.y + (Math.tan(this.robot.angle)*this.robot.x-this.robot.y));

        // let b = Point.add(this.robot.getPoint(), Point.mul(Point.fromAngle(this.robot.angle), 20))
        // let side = this.sign((b.y - this.robot.y) * (lh.x - this.robot.x) - (b.x - this.robot.x) * (lh.x - this.robot.y));

        // let icor = Point.get2PointRadCenter(this.robot.getPoint(), lh, (100*100)/(2*x));
    }

    linePointProject(a, b, p) { return Point.add(a, Point.mulXY(Point.sub(p, a), Point.sub(b, a))); } //a.add(p.sub(a).mul(b.sub(a))); }

    updateKinematics() {

        /*
        this.robotPose = this.getPoint();
        let closest = this.projectToPath(this.robotPose);
        let closestState = new TrajectoryState(closest.x, closest.y, 0, this.speed, 0);
        this.l = this.getLookaheadPoint(this.robotPose);

        const TRACK_WIDTH = 20;
        let b = Point.add(this.robotPose, Point.fromAngle(this.angle)); // a point on the robot line
        let l = Point.dist(this.robotPose, this.l); // distance from lookahead point to rbot pos
        let x = Point.dist(this.linePointProject(this.robotPose, b, this.l), this.l); // horizontal distance (relative to rbot) to lookahead point
        let side = this.sign(Point.cross(Point.fromAngle(this.angle), Point.sub(this.l, this.robotPose)));
        let k = (2 * x * side) / (l * l); // signed curvature

        let targetLeftVel = closest.v * (2 + k * TRACK_WIDTH) / 2;
        let targetRightVel = closest.v * (2 - k * TRACK_WIDTH) / 2;

        targetLeftVel = this.targetToProportional(targetLeftVel, closest.a);
        targetRightVel = this.targetToProportional(targetRightVel, closest.a);
        this.prevRobotPose = this.robotPose;

        ctx.fillStyle = red;
        ctx.strokeStyle = clear;
        ctx.globalAlpha = 1;
        drawCircle(this.robotPose, 5);
        ctx.fill();
        */
    }

    targetToProportional(targetVel, targetAcceleration) {
        let p = 0;
        let v = 0;
        let a = 0;
        let feedForward = (v * targetVel) + (a * targetAcceleration);
        let feedBack = p * (targetVel - Point.sub(this.robotPose, this.prevRobotPose).len());

        return feedForward + feedBack;
    }
}