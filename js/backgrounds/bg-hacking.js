c = document.getElementById("console");
lines = [
    [
        "&emsp;Reading ",
        "package lists... ",
        "Done",
    ],
    [
        "> ",
        "warp",
        ".hack",
        "Time(\"e=mc^2\")",
        "&emsp;&emsp;&emsp;[",
        "==========",
        "=================",
        "=============",
        "=========",
        "========",
        "==============",
        "]"
    ],
    [ "&emsp;Building dependency tree" ],
    [ "&emsp;Discombobulating combobulators..." ],
    [ "&emsp;30140247017041273721037127410626156832048314261046120461234210614054601602640235" ],
    [ "&emsp;73397249023052041206035726504801295830245720674235663454332045324380248324030240" ],
    [ "&emsp;23957923957924029502175073573024736019701703556031255103091078237376838658735868" ],
    [ "&emsp;" ],
    [ 
        "&emsp;Hacking the earth....",
        "<br/>&emsp;WARNING<br/>&emsp;THIS IS A CAPITAL OFFENSE<br/>&emsp;continue? y/n",
        "<br/> > ", "y",
        "<br/><br/>&emsp;WARNING<br/>&emsp;HACKING DETECTED<br/>",
        "<br/>&emsp;Link authorization &emsp;&emsp;e2i13jdh","da29930e8x",
        "<br/>&emsp;Decoding anti-hacking software --commencing",
        "<br/><br/>&emsp;Insert Password:",
        "<br/> > DOF#JJ3@4402FH%J23UUT2J", "D2@321E1W7213777&", "2317-5JF",
        "<br/> > I'm in. <br/><br/>"
    ],
    [ 
        "> ip-hack list --all",
        "<br/>&emsp;&emsp; 192.168.0.1",
        "<br/>&emsp;&emsp; 192.168.1.25",
        "<br/>&emsp;&emsp; 192.168.1.22",
        "<br/>&emsp;&emsp; 192.168.1.44",
        "<br/>&emsp;&emsp; 192.168.1.52",
        "<br/>&emsp;&emsp; 192.168.1.60",
        "<br/>&emsp;&emsp; 192.168.1.67",
        "<br/>&emsp;&emsp; 255.255.255.0",
        "<br/>&emsp;&emsp; 192.168.1.1",
        "<br/>&emsp;&emsp; 123.456.78.9",
        "<br/>&emsp;&emsp; 172.333.69.69",
    ],
    [ 
        "<br/>&emsp;&emsp; Fetching projects... (1/300)",
        "<br/>&emsp;&emsp; Fetching projects... (20/300)",
        "<br/>&emsp;&emsp; Fetching projects... (67/300)",
        "<br/>&emsp;&emsp; Fetching projects... (92/300)",
        "<br/>&emsp;&emsp; Fetching projects... (142/300)",
        "<br/>&emsp;&emsp; Fetching projects... (150/300)",
        "<br/>&emsp;&emsp; Fetching projects... (151/300)",
        "<br/>&emsp;&emsp; Fetching projects... (179/300)",
        "<br/>&emsp;&emsp; Fetching projects... (202/300)",
        "<br/>&emsp;&emsp; Fetching projects... (238/300)",
        "<br/>&emsp;&emsp; Fetching projects... (299/300)<br/>",
    ],
    [
    "<",
    "==========",
    "=========",
    "=================",
    "=========",
    "==========",
    "=================",
    "=============",
    "=========",
    "========",
    "=========",
    "==============",
    ">"
    ]
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function hack(line) {

    c.firstElementChild.innerHTML += "<br/>";
    for (var i = 0; i < line.length; i++) {
        await sleep(i * Math.floor(Math.random()*20));
        c.firstElementChild.innerHTML += line[i];
        c.firstElementChild.innerHTML = c.firstElementChild.innerHTML.substr(c.firstElementChild.innerHTML.length-3000);
    }
}
hack(lines[0])
window.setInterval(()=>hack(lines[Math.floor(Math.random()*lines.length)]), 1000)