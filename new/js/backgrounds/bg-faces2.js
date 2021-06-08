const infoText = document.getElementById("bg-info");
document.getElementById("bg-name").innerHTML = "bg: faces-vae";

infoText.innerHTML = "a variational autoencoder i trained on my freshman yearbook controlled by 3d noise";

const canvas = document.getElementById("canvas");
canvas.style.display = "none";
vid = document.getElementById("bgVideo")
vid.src = "./assets/faces.mp4"
vid.style.display = "block"