
class CubicCurve {
    constructor(p0, p1, p2, p3) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.arcLengths = [];
        this.length = this.getLength();
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
        this.length = 0;
        this.arcLengths = new Array(samples + 1);
        this.arcLengths[0] = 0;
        for (let i = 1; i < samples; i++) {
            let p = this.getPoint(i / (samples - 1));
            let pNext = this.getPoint((i - 1) / (samples - 1));

            this.length += Point.dist(p, pNext);
            this.arcLengths[i] = this.length;
        }
        return this.length;
    }

    remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
    
    mapDistanceToT(dist) {
        this.length = this.getLength();
        let samples = this.arcLengths.length;

        if (0 <= dist && dist <= this.length) {
            for (let i = 1; i < samples; i++) {
                if (this.arcLengths[i - 1] <= dist && dist <= this.arcLengths[i]) {
                    return this.remap(
                        dist,
                        this.arcLengths[i - 1],
                        this.arcLengths[i],
                        (i - 1) / (samples - 1),
                        (i) / (samples - 1)
                    );
                }
            }
        }
        return dist / this.length;
    }

    project(point) {
        let idx = 0;
        let samples = 25; // More samples -> better chance of being correct
        let min = Infinity;
        for (let i = samples + 1; i >= 0; i--) {
            let dist = Math.pow(point, this.getPoint(i / samples), 2);
            if (dist < min) {
                min = dist;
                idx = i;
            }
        }

        let d2ForT = t => Point.dist(point, this.getPoint(t));
        let t = this.localMinimum(0, 1, d2ForT);
        return {t: t, p: this.getPoint(t)};
    }

    localMinimum(min, max, f, epsilon=1e-4) {
        if (epsilon===undefined) epsilon=1e-10;
        let m = min;
        let n = max;
        let k;
        while ((n - m) > epsilon) {
            k = (n + m) / 2;
            if (f(k - epsilon) < f(k + epsilon))
                n = k;
            else
                m = k;
        }
        return k;
    }
}