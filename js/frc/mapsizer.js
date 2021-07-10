var s = {
    mapCanvas: null,
    mapCTX: null,
    container: null,
    pxMeasurementText: null,
    pxToUnitInput: null,
    confirmButton: null,
    img: null,
    width: 0,
    height: 0,
    mapMPos: {x:0, y:0},

    pos1: {x:0, y:0},
    pos2: {x:0, y:0},
    clicking: false,
    pixelsPerUnit: -1,
    measurement: -1
}

window.addEventListener("load", () => {
    s.container = document.getElementById("mapsizer-container");
    s.mapCanvas = document.getElementById("mapsizer");
    s.mapCTX = s.mapCanvas.getContext("2d");
    s.pxMeasurementText = document.getElementById("mapsizer-px-measurement");
    s.pxToUnitInput = document.getElementById("mapsizer-px-to-unit");
    s.confirmButton = document.getElementById("mapsizer-confirm");

    s.img = new Image();
    s.img.onload = function() {
        updateMap()
    };

    s.mapCanvas.addEventListener("mousemove", (e) => {
        s.mapMPos = {x:e.offsetX, y:e.offsetY}
        if (s.clicking && mouseInIMG()) {
            s.pos2 = s.mapMPos
            if (e.ctrlKey) {
                // set the shorter axis to 0?
                var dx = Math.abs(s.pos2.x - s.pos1.x);
                var dy = Math.abs(s.pos2.y - s.pos1.y);
                if (dx > dy) {
                    s.pos2.y = s.pos1.y
                } else {
                    s.pos2.x = s.pos1.x
                }
            }
        }
    });
    
    s.mapCanvas.addEventListener("mousedown", (e) => {
        if (mouseInIMG())
            s.pos1 = s.mapMPos
        s.clicking = true;
    });
    
    s.mapCanvas.addEventListener("mouseup", (e) => {
        s.clicking = false;
    });

    //newMap("./assets/2018field.jpeg")
});

function newMap(src=null, element) {
    if (src == null) {
        if (element.files && element.files[0]) {
            src = URL.createObjectURL(element.files[0]);
        }
    }
    s.confirmButton.disabled = true;
    t.inputEnabled = false;
    s.container.style.display = "block";
    s.img.src = src
}

function mouseInIMG() {
    return Math.abs(s.mapMPos.x - (s.mapCanvas.width/2)) < (s.mapCanvas.clientHeight * (s.img.width/s.img.height))/2
}

function drawX(x, y, size) {
    s.mapCTX.beginPath();
    s.mapCTX.moveTo(x+size, y+size);
    s.mapCTX.lineTo(x-size, y-size);
    s.mapCTX.moveTo(x+size, y-size);
    s.mapCTX.lineTo(x-size, y+size);
    s.mapCTX.stroke();
    s.mapCTX.closePath();
}

function unitToPxChange(element) {
    var value = parseFloat(element.value);
    try {
        if (isNaN(value) || value < 0) {
            element.value = "0";
        }
    } catch { 
        element.value = "0";
    }
    element.value = parseFloat(element.value);
}

function closeMapsizer() {
    s.confirmButton.disabled = true;
    t.inputEnabled = true;
    s.container.style.display = "none";
    s.pos1 = {x:0, y:0};
    s.pos2 = {x:0, y:0};
    s.pixelsPerUnit = -1;
    s.measurement = -1;
}

function confirmMap() {
    t.createMap(2*t.pixelsPerUnit, 2*t.pixelsPerUnit, ((s.height * (s.img.width/s.img.height))/(1/s.pixelsPerUnit)) * t.pixelsPerUnit, (s.height/(1/s.pixelsPerUnit)) * t.pixelsPerUnit, s.img);
    closeMapsizer();
}

function updateMap() {
    if (s.mapCTX != null) {
        s.mapCTX.fillStyle = "black";
        s.mapCTX.fillRect(0, 0, s.mapCanvas.width, s.mapCanvas.height);
    
        s.mapCanvas.width = s.mapCanvas.clientWidth;
        s.mapCanvas.height = s.mapCanvas.clientHeight;
        var width = s.mapCanvas.clientHeight * (s.img.width/s.img.height)
        s.width = width;
        s.height = s.mapCanvas.clientHeight;
        s.mapCTX.drawImage(s.img, (s.mapCanvas.width/2) - (width/2), 0, width, s.mapCanvas.clientHeight);
        s.mapCTX.strokeStyle = "white";
        if (s.pos1.x != 0 && s.pos1.y != 0) {
            drawX(s.pos1.x, s.pos1.y, 5);
            if (s.pos2.x != 0 && s.pos2.y != 0) {
                drawX(s.pos2.x, s.pos2.y, 5);
                s.mapCTX.setLineDash([5, 5]);
                s.mapCTX.beginPath();
                s.mapCTX.moveTo(s.pos1.x, s.pos1.y);
                s.mapCTX.lineTo(s.pos2.x, s.pos2.y);
                s.mapCTX.stroke();
                s.mapCTX.closePath();
                s.mapCTX.setLineDash([]);

                s.measurement = Math.hypot(s.pos1.x - s.pos2.x, s.pos1.y - s.pos2.y);
                s.pixelsPerUnit = parseFloat(s.pxToUnitInput.value)/s.measurement;
                s.pxMeasurementText.innerText = `${Math.round(s.measurement)} pixels is`;
            } else {
                s.pxMeasurementText.innerText = `[measurement incomplete!]`;
            }
        } else {
            s.pxMeasurementText.innerText = `[no measurement yet!]`;
        }

        document.getElementById("mapsizer-unit").innerText = t.units;
        s.confirmButton.disabled = s.pxToUnitInput.value == "0" || s.measurement < 0;
    }
    
    window.requestAnimationFrame(updateMap);
}