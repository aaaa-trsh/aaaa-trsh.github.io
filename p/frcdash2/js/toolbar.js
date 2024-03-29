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
        toolObj: new SimulationTool(),
        id: 2
    },
    {
        name: 'prm',
        src: 'assets/planning-icon.png',
        active: false,
        element: null,
        toolObj: new PRMTool(),
        id: 2
    }
];
let currentTool = tools[0];

const toolbar = document.getElementById("header-list");
let parser = new DOMParser();
for (let i = 0; i < tools.length; i++) {
    tools[i].optionsElement = document.getElementById(tools[i].name+"-settings")
    let element = parser.parseFromString(`
    <li class="header-button" onclick="select(${i})">
        <img draggable="false" src="${tools[i].src}"></img>
    </li>
    `, 'text/html').body.firstChild;
    toolbar.appendChild(element);
    tools[i].element = element;
}

function select(idx) {
    currentTool.toolObj.end();
    tools.forEach((tool, i) => {
        if (i === idx) tool.element.childNodes[1].classList.add("selected");
        else tool.element.childNodes[1].classList.remove("selected");
        tool.active = i === idx; 

        if (tool.optionsElement !== null) {
            tool.optionsElement.style.display = i === idx ? "block" : "none";
        }
    });
    currentTool = tools[idx];
    currentTool.toolObj.start();
}
select(0);