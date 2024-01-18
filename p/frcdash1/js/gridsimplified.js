/*
STEPS TO DO A CURVE:
align with the control point
drive

aka:
addsequential(new AlignToCurve(0));
addSequantial(new DriveCurve());
*/
let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

let btn = document.getElementsByClassName('remove');
let curves = [];

let curve;
let gridSnap = false;
let fieldMove = false;

let field;
let currentlyDragging = false;
let scalefactor = 1.2;
let draggingPoint;
let fieldIMG;

function startGame()
{
    updateButtons();
    frame.start();
    dropdown = document.getElementById("gridslice");
    field = new handle((c.width / 2) - (1163 * scalefactor / 2), (c.height / 2) - (576 * scalefactor / 2), 1163 * scalefactor, "./images/2019Field.png", "image", 576 * scalefactor);
    footToPxX = field.size / 54.0833;
    footToPxY = field.height / 26.5833;
    field.setOffset((1163 *scalefactor) / 2, (576 *scalefactor) / 2);
    field.x = Math.floor(field.x / footToPxX) * footToPxX;
    field.y = Math.round((field.x / footToPxY)) * footToPxY - footToPxY;
    field.alwaysSnap(true);
    createItem();
    draggingPoint = curves[0].targetPoint;
}

let frame = {
    canvas: document.getElementById("canvas"),
    start: function () {
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerHeight * 0.75;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(update, 20);
    },
    clear: function () {
        
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
// Mouse Position
let mX, mY;
window.addEventListener('mousemove', function (e) {
    mX = e.pageX;
    mY = e.pageY;
});

window.addEventListener('keydown', function (e) {
    if (e.keyCode == 17)
    {
        gridSnap = true;
    }

    // if (e.keyCode == 17) {
    //     fieldMove = true;
    // }
});
window.addEventListener('keyup', function (e) {
    if (e.keyCode == 17) {
        gridSnap = false;
    }

    // if (e.keyCode == 17) {
    //     fieldMove = false;
    // }
});
let footToPxX=0;
let footToPxY = 0;
let curvelen = 0;
let tempx = 0, tempy = 0;
let anyActive = false;

function update()
{
    frame.clear();
    field.setState(fieldMove);
    dropdown = document.getElementById("gridslice");
    curvelen = 0;
    field.update();
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";

    for (let x = field.x; x < field.x + field.size; x += footToPxX)
    {
        for (let y = field.y; y < field.y + field.height; y += footToPxY) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 3;

    if (anyActive) {
        ctx.beginPath();
        ctx.arc(draggingPoint.x, draggingPoint.y, 20, 0, 2 * Math.PI);
        ctx.stroke();
    }
    anyActive = false;
    for (let l = 0; l < curves.length; l++)
    {
        curvelen++;
        currentlyDragging = draggingPoint.dragging == true;

        if (dist(draggingPoint.x, draggingPoint.y, mX, mY) > dist(curves[l].targetPoint.x, curves[l].targetPoint.y, mX, mY) && !currentlyDragging) {
            draggingPoint = curves[l].targetPoint;
        }

        if (curves[l].active)
        {
            anyActive = true;
        }

        curves[l].update();
    }
    
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
}

/*CURVES*/
function bezierCurve(handles, element)
{
    this.handles = handles;
    this.targetPoint = handles[0];
    this.active;
    this.endX = 0;
    this.endY = 0;
    this.element = element;

    this.getX = function (t){
        return (1 - t) * ((1 - t) * ((1 - t) * this.handles[0].x + t * this.handles[1].x)
                + t * ((1 - t) * this.handles[1].x + t * this.handles[2].x))
            + t * ((1 - t) * ((1 - t) * this.handles[1].x + t * this.handles[2].x)
                + t * ((1 - t) * this.handles[2].x + t * this.handles[3].x));
    }

    this.getY = function (t) {
        return (1 - t) * ((1 - t) * ((1 - t) * this.handles[0].y + t * this.handles[1].y)
            + t * ((1 - t) * this.handles[1].y + t * this.handles[2].y))
            + t * ((1 - t) * ((1 - t) * this.handles[1].y + t * this.handles[2].y)
                + t * ((1 - t) * this.handles[2].y + t * this.handles[3].y));
    }

    // Gets the derivitive of x and y for calculating the robot angle
    this.getDX = function(t)
    {
        return Math.pow(3 * (1 - t), 2) * (handles[1].x - handles[0].x) + 6 * (1 - t) * t * (handles[2].x - handles[1].x)
            + 3 * Math.pow(t, 2) * (handles[3].x - handles[2].x);
    }

    this.getDY = function(t)
    {
        return Math.pow(3 * (1 - t), 2) * (handles[1].y - handles[0].y) + 6 * (1 - t) * t * (handles[2].y - handles[1].y)
            + 3 * Math.pow(t, 2) * (handles[3].y - handles[2].y);
    }

    // Calculate robot angle at any point in curve
    this.getAngle = function (t)
    {
        return Math.atan2(this.getDY(t), this.getDX(t));
    }

    this.update = function ()
    {
        ctx.restore();

        // Set end x and y based off of endpoint 
        this.endX = this.handles[3].x;
        this.endY = this.handles[3].y;

        // Connect start point to previous end point
        if (curves.length > 0 && curves.indexOf(this) != 0)
        {
            this.handles[0].setToConnect(true);
            this.handles[0].x = curves[curves.indexOf(this) - 1].endX;
            this.handles[0].y = curves[curves.indexOf(this) - 1].endY;
        }
        
        // Move closest point when dragged
        if (dist(this.targetPoint.x, this.targetPoint.y, mX, mY) < this.targetPoint.size * 5.4)
        {
            this.targetPoint.setState(leftmousepressed && this.targetPoint == draggingPoint);
        }

        // Determines if the curve is active
        if (this.handles[0] == draggingPoint || this.handles[1] == draggingPoint || this.handles[2] == draggingPoint || this.handles[3] == draggingPoint) {
            if (dist(mX, mY, draggingPoint.x, draggingPoint.y) < 400) {
                this.active = true;
            } else
            {
                this.active = false;
             }
        } else
        {
            this.active = false;
        }

        // Do CSS stuff when curve is selected
        if (getConnectedElement(curves.indexOf(this)))
        {
            getConnectedElement(curves.indexOf(this)).style.fontWeight = this.active ? 500 : 100;
            getConnectedElement(curves.indexOf(this)).style.fontStyle = this.active ? "italic" : "normal";
        }

        // Draw curve
        ctx.strokeStyle = this.active ? "#ffffff" : "#ffffff77";
        ctx.setLineDash([]);
        ctx.moveTo(this.handles[0].x, this.handles[0].y);
        ctx.bezierCurveTo(this.handles[1].x, this.handles[1].y, this.handles[2].x, this.handles[2].y, this.handles[3].x, this.handles[3].y);
        ctx.stroke();

        let startX = this.getX(0);
        let startY = this.getY(0);
        for (let k = 0.02; k < 1; k = k + 0.02)
        {
            ctx.restore();
            ctx.setLineDash([]);

            let r = document.getElementById("widthbox").value * footToPxX /2;
            let theta = Math.atan2(this.getDY(k), this.getDX(k)) + 1.5708;
            ctx.strokeStyle = "#ffffff";

            // OK so we want a line that is 40px from the current pos on line, at angle (t) on line
            ctx.moveTo(startX + r * Math.cos(theta), startY + r * Math.sin(theta));

            ctx.lineTo(this.getX(k) + r * Math.cos(theta), this.getY(k) + r * Math.sin(theta));

            ctx.moveTo(startX - r * Math.cos(theta), startY - r * Math.sin(theta));
            ctx.lineTo(this.getX(k) - r * Math.cos(theta), this.getY(k) - r * Math.sin(theta));

            //ctx.lineTo(this.getX(k) - r * Math.cos(theta), this.getY(k) - r * Math.sin(theta));

            //ctx.lineTo(this.getX(k) - r * Math.cos(theta), this.getY(k) - r * Math.sin(theta));
            ctx.stroke();
            startX = this.getX(k-0.01);
            startY = this.getY(k-0.01);
            //ctx.stroke();
        }

        // Draw handles
        if (this.active) {
            ctx.strokeStyle = "#ffffff33";

            ctx.setLineDash([6, 6]);
            ctx.moveTo(handles[0].x, handles[0].y);
            ctx.lineTo(handles[1].x, handles[1].y);
            ctx.stroke();
            ctx.moveTo(handles[3].x, handles[3].y);
            ctx.lineTo(handles[2].x, handles[2].y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.strokeStyle = "#ffffff";

        ctx.fillStyle = "#ffffff";

        // Draw coordinate text
        ctx.font = this.active ? "italic 500 15px Roboto" : "100 15px Roboto";
        ctx.fillText(getConnectedElement(curves.indexOf(this)).firstChild.textContent, (this.handles[0].x + this.handles[3].x + this.handles[1].x + this.handles[2].x) / 4, (this.handles[0].y + this.handles[3].y + this.handles[1].y + this.handles[2].y) / 4);

        for (let i = 0; i < this.handles.length; i++) {
            // Sets target point (nearest point)
            if (dist(this.targetPoint.x, this.targetPoint.y, mX, mY) > dist(this.handles[i].x, this.handles[i].y, mX, mY) && !leftmousepressed) {
                if (curves.indexOf(this) != 0) {
                    if (i != 0)
                    {
                        this.targetPoint = this.handles[i];
                    }
                } else
                { 
                    this.targetPoint = this.handles[i];
                }
            }
            // Update handle active state 
            this.handles[i].active = this.active;

            // Update the handles themselves
            if (i != 0 || curves.indexOf(this) == 0)
            {
                this.handles[i].update();
            }
        }
    }
}

function handle(x, y, size, color, type, height)
{ 
    this.x = x;
    this.y = y;
    let xOffset = 0;
    let yOffset = 0;
    this.active = true;

    if (type == "image")
    {
        this.image = new Image();
        this.image.src = color;
    }

    this.roundedX = 0, this.roundedY = 0;

    this.size = size;
    this.height = height;

    this.dragging = false;
    let snap = false;
    this.snapToPrevEnd;
    this.setToConnect = function (state)
    {
        snapToPrevEnd = state;
    }

    this.setState = function (state)
    {
        this.dragging = state;
    }

    this.alwaysSnap = function (state) {
        snap = state;
    }

    this.setOffset = function(xo, yo)
    {
        xOffset = xo;
        yOffset = yo;
    }

    this.update = function ()
    {
        if (this.dragging && !this.snapToPrevEnd) {
            if (gridSnap || snap)
            {
                this.x = Math.round((mX - xOffset) / footToPxX * 2) * footToPxX / 2;
                this.y = Math.round((mY - yOffset) / footToPxY * 2) * footToPxY / 2;
            }
            else {
                // Move to mouse pose
                this.x += (mX - (this.x + xOffset)) * 0.3;
                this.y += (mY - (this.y + yOffset)) * 0.3;
            }
        }
        this.roundedX = Math.round(((this.x) / footToPxX) * 100) / 100;
        this.roundedY = Math.round(((this.y) / footToPxY) * 100) / 100;
        
        // Draw
        if (type == "image") {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.size, this.height);
            ctx.globalAlpha = 1.0;

        } else {
            ctx.fillStyle = color;
            if (!this.active)
            {
                ctx.globalAlpha = 0.2;
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
            if (!this.active) {
                ctx.globalAlpha = 1;
            } else
            {

                ctx.font = "10px Arial";
                ctx.fillText("(" + Math.round(this.x) + "," + Math.round(this.y) + ")", this.x, this.y - size * 2);
             }
        }

    }
}
/*UTILS*/

// Dist
function dist(x1, y1, x2, y2) {
    return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
}

// Get Connected Element
function getConnectedElement(index)
{
    list = document.getElementsByClassName('pathitem');
    for (let l = 0; l < list.length; l++) {
        if (index == l-1)
        {
            return list[l];
        }
    }
}

// Mouse State
let leftmousepressed = false;
window.addEventListener('mousedown', function (e) {
    if (e.button == 0)
    {
        leftmousepressed = true;
    }
});
window.addEventListener('mouseup', function (e) {
    if (e.button == 0) {
        leftmousepressed = false;
    }
});

/*SIDEBAR*/
function create(htmlStr) {
    let frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
let count = 0;

function createItem() {
    count += 1;
    let fragment = create('<li id="' + count + '" class="pathitem"><p class="pathname" id="pathname">Bezier' + count + '<h3 class="pathspeed" id="pathspeed">' + 0.7 + '</h3></p><button class="remove" value="remove" ><i class="fas fa-minus"></i></button></li>');
    
    let addbutton = document.getElementById("add");
    let node = document.getElementById("pathlist").insertBefore(fragment, addbutton);
    curves.push(new bezierCurve([new handle(100, 100, 6, "#ffffff", ""), new handle(150, 50, 4, "#cecece", ""), new handle(150, 150, 4, "#cecece", ""), new handle(200, 100, 6, "#ffffff", "")], node));
    updateButtons();
}

function getChildIndex(child) {
    let parent = child.parentNode;
    let i = parent.children.length - 1;
    for (; i >= 0; i--) {
        if (child == parent.children[i]) {
            break;
        }
    }
    return i;
};

function updateButtons() {
    btn = document.getElementsByClassName('remove')
    for (let l = 0; l < btn.length; l++) {
        btn[l].addEventListener('click', function (e) {
            e.currentTarget.parentNode.remove();
            curves.splice(l - 1, 1);
        }, false);
    }

}

function generateCode()
{
    let container = document.getElementById("code-container");

    // Remove all children, starting with a blank slate
    while (container.firstChild)
    {
        container.removeChild(container.firstChild);
    }

    for (let f = 0; f < curves.length; f++)
    {
        let name = camelize(getConnectedElement(f).firstChild.textContent);
        let speed = getConnectedElement(f).childNodes[1].textContent;
        let thiscurve = curves[f];
        let offsetx= curves[f].handles[0].roundedX;
        let offsety = curves[f].handles[0].roundedY;
        for (let i = 0; i < curves.length; i++)
        {
            if (i < f)
            {
                offsetx += curves[i].handles[3].roundedX;
                offsety += curves[i].handles[3].roundedY;
            }
        }
        
        let fragment = create('<div><h3><span class="curve">BezierCurve</span> <span class="letiable">' + name + '</span> = <span class="new">new</span> <span class="method">BezierCurve</span>(<span class="new">new </span>Point2D.<span class="method">Double</span>(<span class="number">' + Math.round((thiscurve.handles[1].roundedX - offsetx) * 1000) / 1000 + '</span>, <span class="number">' + Math.round((thiscurve.handles[1].roundedY - offsety) * 1000) / 1000 + '</span>),<span class="new">new </span></span>Point2D.<span class="method">Double</span>(<span class="number">' + Math.round((thiscurve.handles[2].roundedX - offsetx) * 1000) / 1000 + '</span>, <span class="number">' + Math.round((thiscurve.handles[2].roundedY - offsety) * 1000) / 1000 + '</span>),<span class="new">new </span></span>Point2D.<span class="method">Double</span>(<span class="number">' + Math.round((thiscurve.handles[3].roundedX - offsetx) * 1000) / 1000 + '</span>, <span class="number">' + Math.round((thiscurve.handles[3].roundedY - offsety) * 1000) / 1000+'</span>));</h3><h3><span class="method">addSequential</span>(<span class="new">new</span> <span class="method">AlignToCurve</span>(<span class="number">' + Math.round((speed * 0.8) *1000)/1000+ '</span>, ' + name + ', <span class="number">0</span>));</h3><h3><span class="method">addSequential</span>(<span class="new">new</span> <span class="method">DriveCurve</span>(<span class="number">'+speed+'</span>, ' + name +',<span class="boolean"> false</span>));</h3></div>');
        document.getElementById("code-container").appendChild(fragment);
    }
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

let loadFile = function (event) {
    var reader = new FileReader();
    reader.onload = function (event) {
        field.image.src = event.target.result;
    }
    reader.readAsDataURL(event.target.files[0]);   
    console.log(event.target.files[0].name);
    document.getElementById("label").textContent = event.target.files[0].name;
};

let setfile = function (url)
{
    field.image.src = "./images/" + url + ".png";
    document.getElementById("label").textContent = "Upload custom field. . .";
}