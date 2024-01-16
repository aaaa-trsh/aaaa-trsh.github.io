const id = "mons";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "thumbnail-360.png",
        origin: "20% 15%",
        transform: "scale(1.2) rotateZ(-5deg)",
        filter: "contrast(1.14) brightness(1.1) saturate(1.13)",
    },
    id: id,
    title: "MONS",
    type: "game",
    game: {
        type: "web",
        link: "https://jovlett.itch.io/mons",
        screenshots: [
            path + "j7jrX9.png",
            path + "qerq2i.png",
            path + "thumbnail.png",
        ],
    },
    article: {
        summary: "A short walk on a 2D mountain with the help of 3D.",
        description: "Shift through the third dimension to solve puzzles, move platforms, and reach the summit! \n\nMade in Brackeys Jam 2020.2",
    },
};
