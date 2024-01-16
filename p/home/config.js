const id = "home";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "thumbnail-360.png",
        origin: "90% 80%",
        transform: "scale(2)",
        filter: "contrast(1.15) brightness(1.1)",
    },
    id: id,
    title: "How Our Mission Ended",
    type: "game",
    game: {
        type: "web",
        link: "https://globalgamejam.org/2019/games/how-our-mission-ended",
        screenshots: [
            path + "2019-01-27_5_4.png",
            path + "home_13.png",
            path + "thumbnail.png",
        ],
    },
    article: {
        summary: "Ever want to chill n' drop some wormholes? You've come to the the right place.",
        description: "This is a game about herding people to a goal with the power of portals. Place wormholes to disable force fields, launch people, and more! What else could you want from a game?\n\nMade in GGJ 2019",
    },
};
