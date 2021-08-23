
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
        return Point.get3PointCircle(this.getPoint(t), this.getPoint(t + 0.001), this.getPoint(t + 0.002));
    }

    getAngle(t) {
        let p = this.getPoint(t);
        let pNext = this.getPoint(t + 0.001);
        return Point.getAngle(p, pNext);
    }

    getControlPoints() { return [this.p0, this.p1, this.p2, this.p3] }

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