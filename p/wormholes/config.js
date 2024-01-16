const id = "wormholes";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "iosp+t-360.png",
        origin: "40% 30%",
        transform: "scale(2)",
        filter: "contrast(0.95) brightness(0.9)",
    },
    id: id,
    title: "Worm<wbr>holes 'n Chill",
    type: "game",
    game: {
        type: "web",
        link: "https://aaa-trsh.itch.io/wormholes-n-chill",
        screenshots: [
            path + "rW5sr0.png",
            path + "iosp+t.png",
            path + "thumbnail.png",
        ],
    },
    article: {
        summary: "Ever want to chill n' drop some wormholes? You've come to the the right place.",
        description: "This is a game about herding people to a goal with the power of portals. Place wormholes to disable force fields, launch people, and more! What else could you want from a game?",
    },
};
