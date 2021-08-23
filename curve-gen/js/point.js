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

    static get3PointCircle(a, b, c) {
        var x12 = (a.x - b.x);
        var x13 = (a.x - c.x);
    
        var y12 = (a.y - b.y);
        var y13 = (a.y - c.y);
    
        var y31 = (c.y - a.y);
        var y21 = (b.y - a.y);
    
        var x31 = (c.x - a.x);
        var x21 = (b.x - a.x);
    
        //x1^2 - x3^2
        var sx13 = Math.pow(a.x, 2) - Math.pow(c.x, 2);
    
        // y1^2 - y3^2
        var sy13 = Math.pow(a.y, 2) - Math.pow(c.y, 2);
    
        var sx21 = Math.pow(b.x, 2) - Math.pow(a.x, 2);
        var sy21 = Math.pow(b.y, 2) - Math.pow(a.y, 2);
    
        var f = ((sx13) * (x12)
                + (sy13) * (x12)
                + (sx21) * (x13)
                + (sy21) * (x13))
                / (2 * ((y31) * (x12) - (y21) * (x13)));
        var g = ((sx13) * (y12)
                + (sy13) * (y12)
                + (sx21) * (y13)
                + (sy21) * (y13))
                / (2 * ((x31) * (y12) - (x21) * (y13)));
    
        var c = -(Math.pow(a.x, 2)) -
        Math.pow(a.y, 2) - 2 * g * a.x - 2 * f * a.y;
    
        var h = -g;
        var k = -f;
        var sqr_of_r = h * h + k * k - c;
    
        // r is the radius
        var r = Math.sqrt(sqr_of_r);
        return {
            x: h,
            y: k,
            r: r
        }
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