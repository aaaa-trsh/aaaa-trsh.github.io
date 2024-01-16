const id = "trshmvmt";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "xIagzN-360.png",
        origin: "53% 52%",
        transform: "scale(1)",
        filter: "contrast(1.2) brightness(0.9) saturate(1.23)",
    },
    id: id,
    title: "trsh-mvmt",
    type: "game",
    game: {
        type: "web",
        link: "https://aaa-trsh.itch.io/trsh-mvmt",
        screenshots: [
            path + "xIagzN.png",
            path + "hzYvDo.png",
            path + "R2vL4t.png",
        ],
    },
    article: {
        summary: "First person movement sandbox.",
        description: "A barebones sandbox for a player controller I'm making. The controls are supposed to have a nice physics-y feel to them, with a focus on gaining and maintaining momentum. Your feedback greatly helps me improve it, so be sure to leave all that in the comments after checking it out.",
    },
};
