/*
TODO:
update tarsier image
add dynamic articles
write articles
add 6644 auto tools
add planet project

 * TacticalBodybuilding
 * BatteriesSoldSeparately
 * FacilityACE
 * Killzone
 * GlobenhausserLegacy
 * FlameyBoi
 * DustAndDiamonds
 * -
 * AutoSnake
 * EyeGAN (+demo)
 * -
 * Floor Detection
 * SODA
 * 6644 FRC 2020
 * 6644 FRC 2020 Offseason CAD
 * 3257 FRC 2021 (BALL-E Autos)
 * 3257 FRC 2022 (Oogwey Code)
 * Tarsier Vision
 * WaveFunctionLabs
*/
let projectsData = [
    {
        title: "trsh-mvmt",
        description: "An open source first person movement system with a focus on momentum and physics inspired by Titanfall 2.",
        img: "/assets/imgs/projects/trsh-mvmt.png",
        img_style: "object-position: left 50%;",
        tools: ["Unity"],
        github: "https://github.com/aaaa-trsh/trsh-mvmt",
        link_text: "Try it out!",
        link_url: "https://aaa-trsh.itch.io/trsh-mvmt",
        article: 0
    },
    {
        title: "KDS",
        description: "A custom driverstation made with Flask for experimental systems like visual SLAM, path planning, locomotion, and more.",
        img: "/assets/imgs/projects/kds.png",
        github: "https://github.com/aaaa-trsh/KDS",
        tools: ["Python", "JavaScript"],
    },
    {
        title: "Quokka",
        description: "A minmalistic webtool that implements the pure pursuit algorithm for trajectory following.",
        img: "./assets/imgs/projects/quokka.png",
        tools: ["JavaScript"],
        link_text: "Demo",
        link_url: "https://aaaa-trsh.github.io/apps/quokka.html",
    },
    {
        title: "AutoEncoder Yearbook",
        description: "A variational autoencoder trained on my highschool yearbook. Deployed to a client side tf.js widget for live face fiddling.",
        img: "./assets/imgs/projects/ai-yearbook.PNG",
        img_style: "object-position: right 50%; filter: hue-rotate(10deg) brightness(1.1);",
        tools: ["Tensorflow", "JavaScript"],
        link_text: "Check it out!",
        link_url: "./article.html?proj=Face%20Blender",
        article: 0,
        article_scripts: [
            "./js/tf.js",
            "./js/vae-widget.js",
        ]
    },
    {
        title: "Vision Module",
        description: "A custom vision module made for mapping and CV. Interfaces with KDS to provide a real-time feed.",
        img: "./assets/imgs/projects/tarsier.png",
        img_style: "object-position: 50% 25%; filter: hue-rotate(10deg) brightness(1.2);",
        tools: ["OpenCV", "Tensorflow", "Python"],
    },
    {
        title: "GLSL Planet",
        description: "A 3D stylized planet made with GLSL shaders for colorization, height maps, atmosphere, etc.",
        img: "./assets/imgs/projects/glsl-planet.png",
        tools: ["JavaScript", "Java"],
        link_text: "Check it out!",
        link_url: "https://aaaa-trsh.github.io/apps/planet.html",
    },
    {
        title: "MuseGen",
        description: "A CharRNN trained to produce questionable classical music, trained on Mozart's greatest hits.",
        img: "./assets/imgs/projects/mozairt.png",
        img_style: "transform: scale(4, 1); object-position: 50% bottom; filter: brightness(2) contrast(3);",
        tools: ["Tensorflow", "Python"],
        link_text: "Read More",
        link_url: "",
        img_style: "transform: scale(4, 1); object-fit:none; object-position: 32% bottom; filter:background-color:#000; filter: brightness(2);",
        github: "https://github.com/aaaa-trsh/MusicGenerator"
    },
];

let projectsTools = {
    "Unity": {
        "img": "https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/unity-512.png", // unity logo
        "link": "https://www.unity.com/"
    },
    "Python": {
        "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Python_icon_%28black_and_white%29.svg/1024px-Python_icon_%28black_and_white%29.svg.png", // python logo
        "link": "https://www.python.org/"
    },
    "Java": {
        "img": "./assets/imgs/icons/java.png", // java logo
        "link": "https://www.java.com/"
    },
    "JavaScript": {
        "img": "./assets/imgs/icons/js.png", // javascript logo
        "link": "https://www.javascript.com/"
    },
    "Tensorflow": {
        "img": "https://icons-for-free.com/iconfiles/png/512/tensorflow-1324440242699707768.png", // tensorflow logo
        "link": "https://www.tensorflow.org/"
    },
    "OpenCV": {
        "img": "./assets/imgs/icons/opencv.png", // opencv logo
        "link": "https://opencv.org/"
    },
}

let projectArticles = [
    `<div class="vae-container">
    <div class="vae-widget">
        <div class="vae-widget-leftbar" style="position:relative;">
            <div class="vae-widget-leftbar-pca-container">
            <h3 class="article-gallery-caption vae-widget-caption" style="padding:0">features</h3>
            </div>
            <h3 class="article-gallery-caption" style="margin:0; position:absolute; bottom:4px; right:10px;">A-B mix</h3>
        </div>
        
        <div class="vae-widget-mix-container">
            <div class="vae-widget-mix-box">
                <input class="vae-widget-mix-slider" oninput="mix(parseFloat(this.value))" type="range" />
                <div class="vae-widget-mix-preset-container" style="position: relative;">
                    <img draggable="false" class="vae-widget-mix-preset" src="https://via.placeholder.com/300/141414/fff?text=1">
                        <button style="left:1px;top:2.4px;" onclick="load(0)"><img src="./assets/imgs/icons/up.png"/></button>
                        <button style="left:1px;top:29px;" onclick="save(0)"><img src="./assets/imgs/icons/save.png"/></button>
                        <h3 class="article-gallery-caption vae-widget-caption" style="color: white;position:absolute;top:2px; right:10px;">FACE A</h3>
                    </img>
                    <img draggable="false" class="vae-widget-mix-preset" style="padding: 0; position:relative;" src="https://via.placeholder.com/300/141414/fff?text=2">
                        <button style="left:1px;top:calc(10vw + 5px)" onclick="load(1)"><img src="./assets/imgs/icons/up.png"/></button>
                        <button style="left:1px;top:calc(10vw + 31px)" onclick="save(1)"><img src="./assets/imgs/icons/save.png"/></button>
                        <h3 class="article-gallery-caption vae-widget-caption" style="color: white;position:absolute;top:calc(10vw + 5px);right:10px;">FACE B</h3>
                    </img>
                </div>
            </div>
        </div>
        
        <div class="vae-widget-output-container" style="position:relative;">
            <canvas id="vae-output-canvas" class="vae-widget-output" src="https://via.placeholder.com/300">
            </canvas>
            <h3 class="article-gallery-caption vae-widget-caption" style="color: white;position:absolute;top:2px;right:10px;">OUTPUT</h3>

            <button style="position:absolute; top:2px; left: 2px;" onclick="
                for (var i = 0; i < sliders.length; i++) {
                    sliders[i].value = (Math.random()-.5) * std[i] * 2 + mean[i];
                }
                decodeCurrent()
            "><img src="./assets/imgs/icons/dice.png"/></button>
        </div>
        <div class="vae-widget-rightbar">
            <h3 class="article-gallery-caption vae-widget-caption" style="text-align:right;">presets</h3>
            <div class="vae-widget-rightbar-grid-container">
            </div>
        </div>
        <script src="./js/tf.js"></script> 
        <script src="./js/vae-widget.js"></script> 
    </div>
</div>
<h1 class="article-header">Making The AI Yearbook<span style="font-size:20pt; float: right; height:100%; line-height:100px;font-weight:200;opacity:0.4;font-style:italic;">originally written August 2020 (HS Freshman)</span></h1>
<p class="article-text">
    Yearbooks are windows into the past; a glimpse into the last few days of school. A simpler time - time of forgotten friends together, endless PG-13 movies, and plenty of dollar-store cookies to go around. 
    <br/><br/>
    As it turns out, yearbooks also have a BUNCH of data!
    <br/><br/>
    In this project, I use around 3,000 images of my fellow students to make a face blending experiment.
</p>
<h1>What even is this thing?</h1>
<p class="article-text">
    Well, its a Convolutional Variational Autoencoder (CVAE). <br/>
    An autoencoder is a model that compresses inputs into a few numbers and uses those to recreate the original using 2 neural networks - one for encoding, and one for decoding.
    <br/><br/>
    A CVAE uses convolutional layers to extract meaningful visual information to process. It also uses tries to center points around the origin vector, resulting in a cleaner blend when in between 2 decodings. It also reduces the number of garbage results in between clusters. 
    <br/>For this project, I am using Tensorflow.
</p>
<h1>Collecting Data</h1>
<p class="article-text">
    This year's high school yearbook (and a few others) have a whole bunch of quality training data. The photos are consistantly lit, have simple backgrounds, and clear subjects. At first I tried to use my phone to capture the pages, folds, glare, and my shaky hands spawned unusable samples. I then used a scanner which made samples much more consistent, but this introduced fine noise and blurring near the edges.
    <br/><br/>
    To extract all of these faces, I built a scraper based on the OpenCV face detector. The script improves sample collection by estimating a grid based on detected face locations. Each grid tile is then cropped and saved.
    <br/><br/>
    Why? To increase the amount of samples. Simply running the OpenCV detector over the entire image would exclude a lot of them - heavy make-up, quirky expressions, and different hair styles would throw off the detector. 
    <br/><br/>
    Overall I collected a decent 2,012 faces from 56 pages. <i>&emsp;(2021 UPDATE: Added 2021 yearbook, now 3637 samples)</i>
</p>
<h1>Training</h1>
<p class="article-text">
    After collecting the data and building the model, the training process began. Everything was smooth sailing until about 48 hours in, when I noticed that the training and testing sets consisted of the same 300 images, so instead of generalizing useful features, the autoencoder was only memorizing the dataset. A quick fix and another 2 days of training lent some results: 
</p>
<div class="article-gallery-container">
    <div class="article-gallery">
        <img src="./assets/imgs/projects/faces/faceGrid1.png"></img>
        <img src="./assets/imgs/projects/faces/faceGrid2.png"></img>
        <img src="./assets/imgs/projects/faces/faceGrid3.png"></img>
    </div>
    <p class="article-gallery-caption">Hey, I can recognize some of these people!</p>
</div>
<h1>Deployment</h1>
<p class="article-text">
    Using the command prompt to summon the model has worked until now, but its not easy to use at all. So, I learned tkinter - a popular GUI tool for python - and made a quick interface for the project. 
</p>
<div class="article-gallery-container">
    <div class="article-gallery">
        <img src="./assets/imgs/projects/faces/pyapp.png"></img>
    </div>
    <p class="article-gallery-caption">A basic Tkinter GUI</p>
</div>
<p class="article-text">
    We're getting there, but this is <i>not good enough</i><br/>
    <br/>
    Consulting with real industry wizards, I was told that I should put this in a website. So, I made a janky prototype widget in HTML and CSS. I tried and failed to port my custom model into Tensorflow.js for a week, but it eventually worked after breaking it up into smaller networks. After linking it to the UI, I had a fast and interesting tool on my hands. 
    <br/><br/>
    In this basic iteration, I also added interpolation - something I'd seen in many other similar implementations - and a bunch of face presets to blend.
</p>
<div class="article-gallery-container">
    <div class="article-gallery">
        <img src="./assets/imgs/projects/faces/webapp.png"></img>
        <img src="./assets/imgs/projects/faces/avgJoe.png"></img>
    </div>
    <p class="article-gallery-caption">The old face tool and the "average Joe" of all faces.</p>
</div>
<h1>Conclusion</h1>
<p class="article-text">
    This project went much smoother than the eye project. I learned how to collect data intentionally and accurately, which is a big step up from blindly downloading data from the Bing. I learned about tkinter GUI, custom models in Tensorflow, and the basics of how to deploy a model. Iteration speed was still a big issue, worsened by the huge quantity of faces. I had to run my computer for around a day and a half just to see any meaningful results, and I remember doing this around 3 times before finally ironing out all the bugs. Now that I have a better computer, I am interested to see how much faster these last coumple of projects will go. I might also do another data collection endeavour to attach a name to each face using OCR.
    <br/><br/>
    And that's it! Feel free to mess around with the widget above, I spent a lot of time on it :)
</p>`,
]


