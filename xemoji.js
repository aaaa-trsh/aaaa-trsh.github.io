void setup() {
    size(400, 400); 
}
////FOR PAMELA: I've been programming 2 years (on and off obviously), and I have learned about 75% of Intro to JS.
//Click to go to a different emoji
var emoji = 0;
var density = 1;
var glare = 170;
mousePressed = function(){
    emoji++;
};
window.addEventListener("click", function(event) {
    emoji++;
});

//The first emoji, the happy one! DONE!!
var happy = function(emojiX, emojiY, emojiSize){
    stroke(232, 232, 232);
    strokeWeight(emojiSize/20/2/2/2);
    fill(225, 255, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(148, 104, 0);
    ellipse(emojiX-emojiSize*0.15, emojiY-emojiSize/9.1, emojiSize/10, emojiSize/20*5);
    ellipse(emojiX+emojiSize*0.09, emojiY-emojiSize/9.1, emojiSize/10, emojiSize/20*5);
    fill(219, 0, 0);
    arc(emojiX-emojiSize*0, emojiY+emojiSize*0.2, emojiSize/2+5, emojiSize/3,radians(-17), radians(202));
    stroke(219, 0, 0);
    strokeWeight(emojiSize/20);
    line(emojiX-emojiSize*0.2, emojiY+emojiSize/5, emojiX+emojiSize/5, emojiY+emojiSize/5.5);
    line(emojiX-emojiSize/4.3, emojiY-emojiSize*-0.17, emojiX+emojiSize/5, emojiY+emojiSize/5);
    stroke(255, 0, 0);
    line(emojiX-emojiSize*0, emojiY-emojiSize*-0.32, emojiX-emojiSize*0.15, emojiY-emojiSize*-0.30);
    line(emojiX-emojiSize*0, emojiY-emojiSize*-0.32, emojiX-emojiSize*-0.15, emojiY-emojiSize*-0.30);
    stroke(240, 240, 240);
    line(emojiX-emojiSize*0.2, emojiY-emojiSize*-0.21, emojiX-emojiSize*0.1, emojiY-emojiSize*-0.22);
    line(emojiX-emojiSize*-0.2, emojiY-emojiSize*-0.21, emojiX-emojiSize*0, emojiY-emojiSize*-0.22);
    stroke(255, 255, 255);
    line(emojiX-emojiSize*-0.1, emojiY-emojiSize*-0.22, emojiX-emojiSize*0.1, emojiY-emojiSize*-0.22);
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,radians(-168), radians(glare/4.5));
};
//The second emoji a kind of "smile"
var smile = function(emojiX, emojiY, emojiSize){
    stroke(232, 232, 232);
    strokeWeight(emojiSize/20/2/2);
    fill(225, 255, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(199, 0, 0);
    ellipse(emojiX-emojiSize*0.159, emojiY-emojiSize*0.11, emojiSize/8.2, emojiSize/5);
    ellipse(emojiX-emojiSize*-0.109, emojiY-emojiSize*0.11, emojiSize/8.2, emojiSize/5);
    fill(225, 255, 0);
    ellipse(emojiX-emojiSize*0.159, emojiY-emojiSize*0.02, emojiSize/8.2, emojiSize/5);
    ellipse(emojiX-emojiSize*-0.106, emojiY-emojiSize*0.02, emojiSize/8.2, emojiSize/5);
    fill(0, 0, 0);
    rect(emojiX-emojiSize/3.41, emojiY-emojiSize/994.6, emojiSize/1.72, emojiSize/4.3, emojiSize);
    fill(255, 255, 255);
    rect(emojiX-emojiSize/3.7, emojiY-emojiSize/-63, emojiSize/1.87, emojiSize/5.0, emojiSize);
    stroke(179, 179, 179);
    line(emojiX-emojiSize*0, emojiY+emojiSize*0.22, emojiX-emojiSize*0, emojiY+emojiSize*0.01);
    line(emojiX-emojiSize*-0.09, emojiY+emojiSize*0.23, emojiX-emojiSize*-0.10, emojiY+emojiSize*0);
    line(emojiX-emojiSize*-0.19, emojiY+emojiSize*0.22, emojiX-emojiSize*-0.20, emojiY+emojiSize*0.02);
    line(emojiX-emojiSize*0.11, emojiY+emojiSize*0.22, emojiX-emojiSize*0.11, emojiY+emojiSize*0.01);
    line(emojiX-emojiSize*0.21, emojiY+emojiSize*0.22, emojiX-emojiSize*0.21, emojiY+emojiSize*0.02);
    line(emojiX-emojiSize*-0.26, emojiY+emojiSize*0.12, emojiX-emojiSize*0.27, emojiY+emojiSize*0.12);
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,-168, glare/4.5);
};
//The third face, a bored or plain "ok" face
var plain = function(emojiX, emojiY, emojiSize){
    stroke(232, 232, 232);
    strokeWeight(emojiSize/20/2/2);
    fill(225, 255, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(191, 0, 0);
    ellipse(emojiX+emojiSize*-0.16, emojiY+emojiSize*-0.12, emojiSize/8, emojiSize/4.9);
    ellipse(emojiX+emojiSize*0.10, emojiY+emojiSize*-0.12, emojiSize/8, emojiSize/4.9);
    stroke(191, 0, 0);
    strokeWeight(emojiSize/14.7);
    line(emojiX+emojiSize/4, emojiY+emojiSize/6.6, emojiX-emojiSize/3, emojiY-emojiSize*-0.15);
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,radians(-168), radians(glare/4.5));
};
//The fourth emoji, confused
var confused = function(emojiX, emojiY, emojiSize){
    stroke(232, 232, 232);
    strokeWeight(emojiSize/60);
    fill(225, 255, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(191, 0, 0);
    ellipse(emojiX+emojiSize*-0.16, emojiY+emojiSize*-0.12, emojiSize/8, emojiSize/8);
    ellipse(emojiX+emojiSize*0.10, emojiY+emojiSize*-0.12, emojiSize/8, emojiSize/8);
    stroke(199, 0, 0);
    noFill();
    strokeWeight(emojiSize/20);
    arc(emojiX-emojiSize*-0.02, emojiY+emojiSize*0.33, emojiSize/2, emojiSize/2, radians(-142), radians(-57));
    arc(emojiX-emojiSize*-0.03, emojiY+emojiSize*0.29, emojiSize/2.0, emojiSize/2.5, radians(-136), radians(-66));
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,radians(-168), radians(glare/4.5));
    textSize(emojiSize/2);
    fill(77, 77, 77);
    text("?", emojiX-emojiSize/6, emojiY-emojiSize*0.25);
};
//The fifth emoji that is silly
var silly = function(emojiX, emojiY, emojiSize){
    stroke(232, 232, 232);
    strokeWeight(emojiSize/46);
    fill(225, 255, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(191, 0, 0);
    ellipse(emojiX-emojiSize*0.155, emojiY-emojiSize*0.12, emojiSize/4.5, emojiSize/9.5);
    fill(255, 255, 255);
    ellipse(emojiX+emojiSize/6, emojiY-emojiSize*0.12, emojiSize/4, emojiSize/4);
    fill(0, 0, 0);
    ellipse(emojiX-emojiSize*-0.165, emojiY-emojiSize*0.12, emojiSize/20, emojiSize/20);
    fill(237, 245, 0);
    ellipse(emojiX-emojiSize*0.155, emojiY-emojiSize/10, emojiSize/4.5, emojiSize/8);
    noStroke();
    fill(199, 0, 0);
    arc(emojiX-emojiSize*0, emojiY-emojiSize/-5, emojiSize/1.9, emojiSize/3.3,radians(-17), radians(202));
    stroke(199, 0, 0);
    strokeWeight(emojiSize/25);
    line(emojiX-emojiSize*0.19, emojiY-emojiSize/-5.5, emojiX-emojiSize*-0.21, emojiY-emojiSize/-4.4);
    line(emojiX-emojiSize*0.20, emojiY-emojiSize/-5, emojiX-emojiSize*-0.22, emojiY-emojiSize/-5);
    fill(255, 125, 251);
    noStroke();
    rect(emojiX-emojiSize/8.9, emojiY-emojiSize*-0.20, emojiSize/4.3, emojiSize*0.2);
    arc(emojiX+emojiSize/200, emojiY+emojiSize/2.6, emojiSize/4-emojiSize/53, emojiSize/4-emojiSize/53, radians(1), radians(180));
    stroke(173, 0, 173);
    strokeWeight(0.7);
    line(emojiX-emojiSize/-47.5, emojiY-emojiSize*-0.4, emojiX-emojiSize*0, emojiY-emojiSize*-0.2);
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,radians(-168), radians(glare/4.5));
};
//The sixth emoji, angry
var angry = function(emojiX, emojiY, emojiSize){
    stroke(232, 232, 232);
    strokeWeight(emojiSize/46);
    fill(255, 0, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(148, 0, 0);
    ellipse(emojiX-emojiSize*0.17, emojiY-emojiSize*0.02, emojiSize/10, emojiSize/10);
    ellipse(emojiX-emojiSize*-0.10, emojiY-emojiSize*0.02, emojiSize/10, emojiSize/10);
    stroke(150, 0, 0);
    noFill();
    strokeWeight(emojiSize/21);
    arc(emojiX-emojiSize/4, emojiY+emojiSize/6.7, emojiSize/2.1, emojiSize/2.1, radians(-102), radians(-44));
    arc(emojiX-emojiSize*-0.18, emojiY+emojiSize/7.4, emojiSize/2.1, emojiSize/2.1, radians(-139), radians(-76));
    fill(161, 0, 0);
    noStroke();
    ellipse(emojiX-emojiSize/33, emojiY+emojiSize/3.85, emojiSize/2-emojiSize/25, emojiSize/2-emojiSize/7);
    fill(255, 0, 0);
    ellipse(emojiX-emojiSize/33, emojiY+emojiSize/3.24, emojiSize/2-emojiSize/25, emojiSize/2-emojiSize/7);
    rect(emojiX-emojiSize/4*1.1, emojiY-emojiSize/4*-0.7, emojiSize/2, emojiSize/6);
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,radians(-168), radians(glare/4.5));
};
//The evil/demon seventh emoji I couldn't make it a stamp
//because of the annoying triangles that would go away
//when I made the triangles based on the user's X and Y.
//Sorry.
var evil = function(emojiX, emojiY, emojiSize){
    fill(170, 0, 255);
    triangle(65, 72, 218, 121, 171, 286);
    triangle(338, 66, 178, 121, 213, 286);
    colorMode(HSB);
    fill(frameCount%255, 255, 255);
    colorMode(RGB);
    ellipse(117, 71, 103, 49);
    ellipse(124, 78, 103, 49);
    ellipse(132, 85, 103, 49);
    ellipse(292, 71, 103, 49);
    ellipse(275, 78, 103, 49);
    ellipse(259, 85, 103, 49);
    stroke(221, 0, 255);
    fill(170, 0, 255);
    ellipse(200, 200, 200, 200);
    noStroke();
    fill(148, 0, 0);
    ellipse(193, 233, 96, 76);
    fill(170, 0, 255);
    rect(136, 183, 131, 51);
    ellipse(193, 223, 90, 72);
    fill(148, 0, 0);
    ellipse(169, 197, 20, 20);
    ellipse(222, 197, 20, 20);
    stroke(150, 0, 0);
    noFill();
    strokeWeight(8);
    arc(150, 217, 75, 75, radians(-102), radians(-44));
    arc(238, 215, 75, 71, radians(-146), radians(-79));
    fill(161, 0, 0);
    noStroke();
    fill(255, 255, 255, glare);
    noStroke();
    arc(197, 146, 134, 61,radians(-168), radians(glare/4.5));
};
//SUPRISE!
var suprised = function(emojiX, emojiY, emojiSize){ 
    stroke(232, 232, 232);
    strokeWeight(emojiSize/46);
    fill(225, 255, 0);
    ellipse(emojiX, emojiY, emojiSize, emojiSize);
    noStroke();
    fill(255, 255, 255);
    ellipse(emojiX-emojiSize/4.5, emojiY-emojiSize/20, emojiSize/4, emojiSize/4);
    ellipse(emojiX+emojiSize/5.05, emojiY-emojiSize/20, emojiSize/4, emojiSize/4);
    fill(0, 0, 0);
    ellipse(emojiX-emojiSize/4.5, emojiY-emojiSize/20, emojiSize/13, emojiSize/13);
    ellipse(emojiX+emojiSize/5.05, emojiY-emojiSize/20, emojiSize/13, emojiSize/13);
    stroke(199, 0, 0);
    strokeWeight(emojiSize/20);
    line(emojiX+emojiSize/20*0.5, emojiY+emojiSize/4*0.98, emojiX-emojiSize/10, emojiY+emojiSize/4*0.97);
    noFill();
    arc(emojiX+emojiSize/5, emojiY-emojiSize/11, emojiSize-emojiSize/1.7, emojiSize-emojiSize/1.6, radians(-131), radians(-42));
    arc(emojiX-emojiSize/4.5,emojiY-emojiSize/11, emojiSize-emojiSize/1.7, emojiSize-emojiSize/1.6, radians(-131), radians(-42));
    noFill();
    strokeWeight(7);
    fill(255, 255, 255, glare);
    noStroke();
    arc(emojiX-emojiSize/36, emojiY-emojiSize*0.27, emojiSize*0.7, emojiSize/3,radians(-168), radians(glare/4.5));
};
draw = function() {
    colorMode(HSB);
    background(frameCount%255, 255, 255);
    colorMode(RGB);
    if(emoji === 0){
        
    for (var i = 0.5; i < 10; i+=1) {
        happy(i*40, 44, 34);
    }
    for (var i = 0.5; i < 10; i+=1) {
        smile(i*40, 82, 34);
    }
    for (var i = 0.5; i < 10; i+=1) {
        plain(i*40, 121, 34);
    }
    for (var i = 0.5; i < 10; i+=1) {
        confused(i*40, 159, 34);
    }
    for (var i = 0.5; i < 10; i+=1) {
        silly(i*40, 198, 34);
    }
    for (var i = 0.5; i < 10; i+=1) {
        angry(i*40, 238, 34);
    }
    for (var i = 0.5; i < 10; i+=1) {
        suprised(i*40, 276, 34);
    }
    fill(0, 0, 0);
    textSize(81);
    text("My emoji", 39, 140);
    textSize(20);
    text("Click to go to next slide", 93, 389);
    text("By: var M{e} === M{e}", 98, 324);
    }
    else if(emoji === 1){
        
        happy(200, 200, 200);
        textSize(20);
        fill(0, 0, 0);
        text("Nice Job!", 151, 358);
        happy(256, 352, 30);
        fill(0, 0, 0);
        text("COOL!", 163, 328);
        happy(246, 320, 30);
        fill(0, 0, 0);
        textSize(30);
        text("Happy", 153, 83);
        //emoji(x, y, size);
        
    }
    else if (emoji === 2){
        smile(200, 200, 200);
        textSize(20);
        fill(0, 0, 0);
        text("Finally, did it!", 125, 358);
        smile(256, 352, 30);
        fill(0, 0, 0);
        text("yess. . .", 156, 328);
        smile(246, 320, 30);
        fill(0, 0, 0);
        textSize(30);
        text("''Smile''", 153, 83);
    }
    else if (emoji === 3){
        plain(200, 200, 200);
        textSize(20);
        fill(0, 0, 0);
        text("I'm so BORED", 107, 358);
        plain(256, 352, 30);
        fill(0, 0, 0);
        text("Ok, fine", 156, 328);
        plain(246, 320, 30);
        fill(0, 0, 0);
        textSize(30);
        text("Bored/Reluctant", 83, 83);
    }
    else if (emoji === 4){
        confused(200, 200, 200);
        textSize(20);
        fill(0, 0, 0);
        text("What did you say?", 68, 358);
        confused(256, 352, 30);
        fill(0, 0, 0);
        textSize(20);
        text("I don't get it", 119, 328);
        confused(246, 320, 30);
        fill(0, 0, 0);
        textSize(30);
        text("Confused", 126, 73);
    }
    else if (emoji === 5){
        silly(200, 200, 200);
        textSize(20);
        fill(0, 0, 0);
        text("Nice joke", 154, 358);
        silly(256, 352, 30);
        fill(0, 0, 0);
        textSize(20);
        text("Just kidding!", 119, 328);
        silly(246, 320, 30);
        fill(0, 0, 0);
        textSize(30);
        text("Silly", 168, 73);
    }
    else if (emoji === 6){
        angry(200, 200, 200);
        textSize(24);
        fill(0, 0, 0);
        text("Jeez. . .", 129, 358);
        angry(256, 352, 30);
        fill(0, 0, 0);
        textSize(14);
        text(". . .What! WHY DID YOU. . .", 27, 328);
        angry(246, 320, 30);
        fill(0, 0, 0);
        textSize(30);
        text("Angry", 168, 73);
    }
    else if (emoji === 7){
        evil();
        textSize(13);
        fill(0, 0, 0);
        text("I captured him! [INSERT EMOJI HERE]", 7, 358);
        fill(0, 0, 0);
        textSize(14);
        text("I am going to rec it! Mwa ha ha! [INSERT EMOJI HERE]", 27, 328);
        fill(0, 0, 0);
        textSize(30);
        text("Evil", 168, 73);
    }
    else if (emoji === 8){
        textSize(15);
        fill(0, 0, 0);
        text("Sorry for the [INSERT EMOJI HERE]'s.\nIt was because of the annoying triangles that would go \naway when I made the triangles based on the user's X and \nY input. \nSorry, I just couldn't get it to work.\nThis next one is going to work though!", 7, 113);
    }
    else if(emoji === 9){
        suprised(200, 200, 200);
        textSize(24);
        fill(0, 0, 0);
        text("OMAHGERD", 92, 358);
        suprised(256, 352, 30);
        fill(0, 0, 0);
        textSize(13);
        text("W8! ITS AT 2:30!?! I'M 1 HOUR LATE!", 46, 328);
        suprised(298, 320, 41);
        fill(0, 0, 0);
        textSize(30);
        text("Suprised", 133, 73);
    }
    else if(emoji === 10){
        emoji=0;
    }
    glare+=density;
    if(glare === 200||glare === 150){
        density*=-1;
    }
};