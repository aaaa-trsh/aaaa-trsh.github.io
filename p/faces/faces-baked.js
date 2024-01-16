const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "faces";

infoText.innerHTML = "autoencoder trained on my yearbook w/ noise eigenvalue control";

const canvas = document.getElementById("canvas");
canvas.style.display = "none";
vid = document.getElementById("bgVideo")
vid.src = "./assets/faces.mp4"
vid.style.display = "block"