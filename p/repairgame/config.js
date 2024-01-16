const id = "repairgame";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "Screenshot (169)-360.png",
        origin: "10% 100%",
        transform: "scale(2)",
        filter: "saturate(1.13) brightness(1.07) contrast(1.02)",
    },
    id: id,
    title: "Repair Game",
    type: "game",
    game: {
        type: "web",
        link: "https://globalgamejam.org/2020/games/repair-game-4",
        screenshots: [
            path + "Screenshot (165).png",
            path + "Screenshot (166).png",
            path + "Screenshot (167).png",
            path + "Screenshot (169).png",
        ],
    },
    article: {
        summary: "Our platformer is broken, so it's your job to fix it!",
        description: "Hack into the game to fix your way though levels. Move keys, abuse physics, and escape! \n\nMade in GGJ 2020",
    },
};
