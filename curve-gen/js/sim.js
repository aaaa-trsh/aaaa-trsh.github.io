class PurePursuitRobot extends Point {
    constructor (x, y, angle, path, lookaheadDist) {
        super(x, y);
        this.angle = angle;
        this.path = path;
        this.lookaheadDist = lookaheadDist;
        this.lastLookahead = null;
        this.speed = 0;
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

        for (let i = this.path.length - 1; i >= 0; i--) {
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
        let len = ab.len();
        let dot = Point.dot(ap, ab);

        let t = Math.min(1, Math.max( 0, dot / len ));

        //dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );
        console.log(t)
        return {p: Point.add(a, Point.mul(ab, t)), i: idx + t}; //{
        //     point: {
        //         x: a.x + atob.x * t,
        //         y: a.y + atob.y * t
        //     },
        //     left: dot < 1,
        //     dot: dot,
        //     t: t
        // };
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
        lookaheadProposals.filter(p => this.projectToPath(p))
        //console.log(lookaheadProposals);
        if (this.path.length > 0) {
            let lastPoint = this.path[this.path.length - 1];

            let endX = lastPoint.x;
            let endY = lastPoint.y;

            if (Math.sqrt((endX - x) * (endX - x) + (endY - y) * (endY - y)) <= r) {
                return lastPoint;
            }
        }

        // let lookaheadT = lookaheadProposals.map(x)
        let lookahead = new Point(mx, my);

        let retval = lookahead;
        if (lookahead != null) {
            this.lastLookahead = lookahead;
        }
        return lookaheadProposals;//lookahead != null ? lookahead : (this.lastLookahead != null ? this.lastLookahead : this.closestPointToRobot());
    }
}