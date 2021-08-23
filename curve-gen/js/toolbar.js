const tools = [
    {
        name: 'curve',
        src: 'assets/curve-icon.png',
        active: true,
        element: null,
        toolObj: new CurveTool(),
        id: 0
    },
    {
        name: 'point',
        src: 'assets/point-icon.png',
        active: false,
        element: null,
        toolObj: new PointGenTool(),
        id: 1
    },
    {
        name: 'simulate',
        src: 'assets/sim-icon.png',
        active: false,
        element: null,
        toolObj: new PointGenTool(),
        id: 1
    }
];
let currentTool = tools[0];

const toolbar = document.getElementById("header-list");
let parser = new DOMParser();
for (let i = 0; i < tools.length; i++) {
    let element = parser.parseFromString(`
    <li class="header-button" onclick="select(${i})">
        <img draggable="false" src="${tools[i].src}"></img>
    </li>
    `, 'text/html').body.firstChild;
    toolbar.appendChild(element);
    tools[i].element = element;
}

function select(idx) {
    tools.forEach((tool, i) => {
        if (i === idx) tool.element.childNodes[1].classList.add("selected");
        else tool.element.childNodes[1].classList.remove("selected");
        tool.active = i === idx; 
    });
    currentTool = tools[idx];
}
select(0);