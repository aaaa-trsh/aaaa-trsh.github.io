
class CubicCurve {
    constructor(p0, p1, p2, p3) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    getPoint(t) {
        let t2 = t * t;
        let t3 = t2 * t;
        let x = this.p0.x * (1 - t) * (1 - t) * (1 - t) +
            this.p1.x * 3 * t * (1 - t) * (1 - t) +
            this.p2.x * 3 * t2 * (1 - t) +
            this.p3.x * t3;
        let y = this.p0.y * (1 - t) * (1 - t) * (1 - t) +
            this.p1.y * 3 * t * (1 - t) * (1 - t) +
            this.p2.y * 3 * t2 * (1 - t) +
            this.p3.y * t3;
        return new Point(x, y);
    }
    
    getCurvature(t) {
        let t2 = t * t;
        let t3 = t2 * t;

        // first derivative
        let d1x = this.p0.x * (-3 * t2 + 3 * t3) +
            this.p1.x * (9 * t2 - 12 * t3 + 3 * t) +
            this.p2.x * (-9 * t2 + 6 * t3) +
            this.p3.x * (3 * t2);
        let d1y = this.p0.y * (-3 * t2 + 3 * t3) +
            this.p1.y * (9 * t2 - 12 * t3 + 3 * t) +
            this.p2.y * (-9 * t2 + 6 * t3) +
            this.p3.y * (3 * t2);
        
        // second derivative
        let d2x = this.p0.x * (-6 * t2 + 12 * t3) +
            this.p1.x * (18 * t2 - 12 * t3) +
            this.p2.x * (-18 * t2 + 6 * t3) +
            this.p3.x * (6 * t2);
        let d2y = this.p0.y * (-6 * t2 + 12 * t3) +
            this.p1.y * (18 * t2 - 12 * t3) +
            this.p2.y * (-18 * t2 + 6 * t3) +
            this.p3.y * (6 * t2);
        
        let d1 = new Point(d1x, d1y);
        let d2 = new Point(d2x, d2y);
            
        return (Point.det(d1, d2) / Point.pow(d1, 3).len());
    }

    getNormal(t) {
        let t2 = t * t;
        let t3 = t2 * t;

        let dx = this.p0.x * (-3 * t2 + 3 * t3) +
            this.p1.x * (9 * t2 - 12 * t3 + 3 * t) +
            this.p2.x * (-9 * t2 + 6 * t3) +
            this.p3.x * (3 * t2);
        let dy = this.p0.y * (-3 * t2 + 3 * t3) +
            this.p1.y * (9 * t2 - 12 * t3 + 3 * t) +
            this.p2.y * (-9 * t2 + 6 * t3) +
            this.p3.y * (3 * t2);
        let norm = new Point(dx, dy);
        norm.normalize();
        return norm;
    }

    getTangent(t) {
        let t2 = t * t;
        let t3 = t2 * t;

        let dx = this.p0.x * (-3 * t2 + 3 * t3) +
            this.p1.x * (9 * t2 - 12 * t3 + 3 * t) +
            this.p2.x * (-9 * t2 + 6 * t3) +
            this.p3.x * (3 * t2);
        let dy = this.p0.y * (-3 * t2 + 3 * t3) +
            this.p1.y * (9 * t2 - 12 * t3 + 3 * t) +
            this.p2.y * (-9 * t2 + 6 * t3) +
            this.p3.y * (3 * t2);
        let tangent = new Point(dx, dy);
        tangent.normalize();
        return tangent;
    }

    getAngle(t) {
        let p = this.getPoint(t);
        let pNext = this.getPoint(t + 0.001);
        return Point.getAngle(p, pNext);
    }

    getLength(samples=100) {
        let length = 0;
        for (let i = 1; i < samples; i++) {
            let p = this.getPoint(i / (samples - 1));
            let pNext = this.getPoint((i - 1) / (samples - 1));
            length += Point.dist(p, pNext);
        }
        return length;
    }
}