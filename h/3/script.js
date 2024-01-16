function changeBackground() {    
    const ims = [
        "IMG_20181227_172449163_HDR.jpg",
        "IMG_20190621_235931381.jpg",
        "IMG_20190627_205003831.jpg",
        "IMG_20190817_183807368.jpg",
        "IMG_20220923_062652566_HDR_001.jpg",
        "IMG_20220923_061236884.jpg",
        "IMG_20220920_063025259.jpg",
        "IMG_20220909_082603206.jpg",
    ];

    document.documentElement.style.setProperty('--bg', `url(/assets/imgs/random/photos/${ims[Math.floor(Math.random() * ims.length)]})`);
}

changeBackground();
setInterval(changeBackground, 5000);
