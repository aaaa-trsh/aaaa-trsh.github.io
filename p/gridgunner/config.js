const id = "gridgunner";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "thumbnail-360.png",
        origin: "40% 90%",
        transform: "scale(2.5)",
        filter: "contrast(0.9) brightness(1.05) saturate(1.2)",
    },
    id: id,
    title: "Grid Gunner",
    type: "game",
    game: {
        type: "mobile",
        link: "https://play.google.com/store/apps/details?id=com.JoathrentStudios.GridGunner&hl=en_US&gl=US",
        screenshots: [
            path + "screenshot1.png",
            path + "screenshot2.png",
            path + "thumbnail.png",
        ],
    },
    article: {
        summary: "Your mission? Take out the operation from within!",
        description: "In this turn-based-bullet-hell combo, everything moves when you do. Watch your step!\n\nMade in Ludum Dare 41, 2018",
    },
};
