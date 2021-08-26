class PurePursuitRobot {
    constructor (x, y, angle, path) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.path = path;
    }
    
    sign(x) {
        return x == 0 ? 1 : Math.sign(x);
    }
    
    getLookaheadPoint(x, y, r) {
        let lookahead = null;

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

            let x1 = (D * dy + sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);
            let x2 = (D * dy - sign(dy) * dx * Math.sqrt(discriminant)) / (d * d);

            let y1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);
            let y2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (d * d);

            let validIntersection1 = Math.min(p1.x, p2.x) < x1 && x1 < Math.max(p1.x, p2.x)
                || Math.min(p1.y, p2.y) < y1 && y1 < Math.max(p1.y, p2.y);
                let validIntersection2 = Math.min(p1.x, p2.x) < x2 && x2 < Math.max(p1.x, p2.x)
                || Math.min(p1.y, p2.y) < y2 && y2 < Math.max(p1.y, p2.y);

            if (validIntersection1 || validIntersection2) lookahead = null;

            if (validIntersection1) {
                lookahead = new Point(x1 + x, y1 + y);
            }

            if (validIntersection2) {
                if (lookahead == null || Math.abs(x1 - p2.x) > Math.abs(x2 - p2.x) || Math.abs(y1 - p2.y) > Math.abs(y2 - p2.y)) {
                    lookahead = new Point(x2 + x, y2 + y);
                }
            }
        }

        if (this.path.length > 0) {
            let lastPoint = this.path[this.path.length - 1];

            let endX = lastPoint.x;
            let endY = lastPoint.y;

            if (Math.sqrt((endX - x) * (endX - x) + (endY - y) * (endY - y)) <= r) {
                return lastPoint;
            }
        }

        return lookahead != null ? lookahead : null;
    }


}