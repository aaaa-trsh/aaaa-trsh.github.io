var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

var btn = document.getElementsByClassName('remove')
var curves = [];

function updateButtons()
{
    for (var l = 0; l < btn.length; l++) {
        btn[l].addEventListener('click', function (e) {
            e.currentTarget.parentNode.remove();
            curves.splice(l-1, 1);
            //this.closest('.single').remove() // in modern browsers in complex dom structure
            //this.parentNode.remove(); //this refers to the current target element 
            //e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        }, false);
    }
}

function startGame()
{
    updateButtons();
    myGameArea.start();
}
var mX, mY;
window.addEventListener('mousemove', function (e) {
    mX = e.pageX;
    mY = e.pageY;
});

//window.addEventListener("click", startDrag);

var myGameArea = {
    canvas: document.getElementById("canvas"),
    start: function () {
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerHeight * 0.8;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
}

// Click and release detection
var mouseDown = [0, 0, 0, 0, 0, 0, 0, 0, 0]
var leftclicks = 0;
document.body.onmousedown = function (evt) {
    mouseDown[evt.button] += 1;
    // if the button is left mouse btn, add to left clicks
    if (evt.button == 0) {
        leftclicks += 1;
    }
    for (var c = 0; c < curves.length; c++)
    {
        curves[c].startDrag();
    }  
}
document.body.onmouseup = function (evt) {
    // reset the mouse downs for current click
    mouseDown[evt.button] = 0;
    // for release detection
    if (evt.button == 0) {
        leftclicks += 1;
    }
}

function component(width, height, color, x, y)
{
    var dragging = false;

    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    
    this.update = function ()
    {
        ctx = myGameArea.context;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ffffff";

        if (!this.dragging) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y + 10, width / 2, 0, 2 * Math.PI);
            ctx.fill();

            //ctx.fillRect(this.x + 10, this.y + 10, this.width, this.height);

            ctx.fillStyle = color;
            //ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.beginPath();
            ctx.arc(this.x, this.y, width / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            //ctx.fillRect(this.x + 10, this.y + 10, this.width + 5, this.height + 5);
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y + 15, width / 2 + 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = color;
            //ctx.fillRect(this.x, this.y-10, this.width, this.height);
            ctx.beginPath();
            ctx.arc(this.x, this.y, width / 2 + 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }
}
function bezierCurve(node, id) {
    var end = new component(30, 30, "#ffffff", Math.random() * 100 + 400, Math.random() * 600);
    var endX = end.x;
    var endY = end.y;
    var control1 = new component(30, 30, "#f54433", Math.random() * 100 + 400, Math.random() * 600);
    var control2 = new component(20, 20, "#f533a1", Math.random() * 100 + 400, Math.random() * 100);
    var start = getChildIndex(node) == 0 ? new component(30, 30, "#ffffff", Math.random() * 100 + 400, Math.random() * 600) :
        new component(30, 30, "#f54433", curves[getChildIndex(node) - 1].endX, curves[getChildIndex(node) - 1].endY);

    var active;
    var targetIndex = 1;
    var points = [start, control1, control2, end];
    var length = 0;

    this.startDrag = function () { //TODO: hold g to snap to grid
        if (mouseDown[0] == 1) {
            if (Math.sqrt(((mX - points[targetIndex].x) * (mX - points[targetIndex].x)) + ((mY - points[targetIndex].y) * (mY - points[targetIndex].y))) < points[targetIndex].width * 2.3) {
                points[targetIndex].dragging = true;
            }
        }
    }
    this.selectCurve = function ()
    {
        active = true;
    }
    this.deselectCurve = function () {
        active = false;
    }

    this.getX = function (t) {
        return (1 - t) * ((1 - t) * ((1 - t) * start.x + t * control1.x) + t * ((1 - t) * control1.x + t * control2.x)) + t * ((1 - t) * ((1 - t) * control1.x + t * control2.x) + t * ((1 - t) * control2.x + t * end.x));
    }

    this.getY = function (t) {
        return (1 - t) * ((1 - t) * ((1 - t) * start.y + t * control1.y) + t * ((1 - t) * control1.y + t * control2.y)) + t * ((1 - t) * ((1 - t) * control1.y + t * control2.y) + t * ((1 - t) * control2.y + t * end.y));
    }

    this.draw = function ()
    {
        
    }
    this.update = function () {
        endX = end.x;
        endY = end.y;
        // move the target selected point when it is being dragged
        if (points[targetIndex].dragging && active) {
            points[targetIndex].x += ((mX) - points[targetIndex].x) * 0.4;
            points[targetIndex].y += ((mY) - points[targetIndex].y) * 0.4;
        }
        // if its not being dragged, check for new closest target point
        if (!points[targetIndex].dragging && active) {
            for (var i = 0; i < points.length; i++) {
                if (dist(mX, mY, points[targetIndex].x, points[targetIndex].y) > dist(mX, mY, points[i].x, points[i].y)) {
                    targetIndex = i;
                } else {
                    targetIndex = targetIndex;
                }
            }
        }

        // if the mouse is released, reset count and stop dragging
        if (leftclicks == 2) {
            points[targetIndex].dragging = false;
            leftclicks = 0;
        }
        ctx.fillStyle = "#ffffff";

        ctx.fillText(start.y, window.innerWidth / 2, window.innerHeight / 2 - 100 * id);

        ctx.fillText(endY, window.innerWidth / 2, window.innerHeight / 2 - 50 * id);
        // draw line and set the length
        var len = 50;
        var arcLengths = new Array(51);
        arcLengths[0] = 0;

        var ox = this.getX(0), oy = this.getY(0), clen = 0;
        for (var i = 1; i <= this.len; i += 1) {
            var x = this.getX(i / len), y = this.getY(i / len);
            var dx = ox - x, dy = oy - y;
            clen += Math.sqrt(dx * dx + dy * dy);
            this.arcLengths[i] = clen;

            // resets so that line segment starts at previous ending,
            // making the line continous
            ox = x;
            oy = y;
        }
        // set length
        length = clen;

        // draw control and end lines
        if (active) {
            ctx.strokeStyle = "#ffffff";
        }
        else
        {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        }
        if (active)
        {
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(control1.x, control1.y);
            ctx.stroke();

            ctx.moveTo(end.x, end.y);
            ctx.lineTo(control2.x, control2.y);
            ctx.stroke();
        }

        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y);

        ctx.stroke();
        


        if (active)
        {
            start.update();
            end.update();
            control1.update();
            control2.update();
        }
    }
}
function dist(x1, y1, x2, y2)
{
    return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
}

function updateGameArea()
{
    myGameArea.clear();

    ctx = myGameArea.context;

    ctx.lineWidth = 5;
    
    for (var c = 0; c < curves.length; c++)
    {
        curves[c].update();

        if (c == curves.length-1) {
            curves[c].selectCurve();
        }
    }

}
 
function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
var count = 0;
function createItem() {
    count += 1;
    var fragment = create('<li id="'+count+'">Bezier'+count+'<button class="remove" value="remove" ><i class="fas fa-minus"></i></button></li>');
    // You can use native DOM methods to insert the fragment:
    
    var addbutton = document.getElementById("add");
    document.getElementById("pathlist").insertBefore(fragment, addbutton);
    curves.push(new bezierCurve(document.getElementById(count), count));
    updateButtons();
}

function getChildIndex(child) {
    var parent = child.parentNode;
    var i = parent.children.length - 1;
    for (; i >= 0; i--) {
        if (child == parent.children[i]) {
            break;
        }
    }
    return i;
};