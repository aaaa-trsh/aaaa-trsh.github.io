function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function sampleScale(x) {
    x = Math.round(Math.min(Math.max(x, 0.01), 0.99) * 100)
    var imData = ctx.getImageData(x, 0, 1, 1).data;
    //var str = rgbToHex(imData[0], imData[1], imData[2])
    return [imData[0], imData[1], imData[2]]
}