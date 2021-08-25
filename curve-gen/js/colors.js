const yellow = "#ecf542"
const lightBlue = "#7cd5f1";
const darkBlue = "#2a4552";
const red = "#f73b6e";
const white = "#ffffff";
const black = "#000000";
const clear = "#0000";
const bg = "#161b1e";
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function lerp(a, b, amt) {
    return (b - a) * amt + a;
}

function lerpColor(c1, c2, a) {
    return `rgb(${this.lerp(c1.r, c2.r, a)}, ${this.lerp(c1.g, c2.g, a)}, ${this.lerp(c1.b, c2.b, a)})`;
}