class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static fromArray(arr) {
        return new Point(arr[0], arr[1]);
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }

    static det(a, b) {
        return a.x * b.y - a.y * b.x;
    }

    static sub(a, b) {
        return new Point(a.x - b.x, a.y - b.y);
    }

    static mul(a, b) {
        return new Point(a.x * b, a.y * b);
    }

    static mulXY(a, b) {
        return new Point(a.x / b.x, a.y / b.y);
    }

    static add(a, b) {
        return new Point(a.x + b.x, a.y + b.y);
    }

    static div(a, b) {
        return new Point(a.x / b, a.y / b);
    }
    
    static divXY(a, b) {
        return new Point(a.x / b.x, a.y / b.y);
    }

    static pow(a, b) {
        return new Point(Math.pow(a.x, b), Math.pow(a.y, b));
    }        

    static dist(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    static lerp(a, b, t) {
        return new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }

    static getAngle(a) {
        return Math.atan2(a.y, a.x);
    }

    normalize() {
        let len = this.len();
        return new Point(this.x / len, this.y / len);
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    rotate(angle) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return new Point(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }

    mirror(o, p) {
        let d = Point.sub(o, p);
        this.x = -d.x + o.x;
        this.y = -d.y + o.y;
    }
}