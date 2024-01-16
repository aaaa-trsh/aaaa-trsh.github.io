const id = "rpgpg";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "thumbnail-360.png",
        origin: "50% 0%",
        transform: "scale(1.2)",
        filter: "contrast(1.05) brightness(1.2) saturate(1.1)",
    },
    id: id,
    title: "RPGPG",
    type: "game",
    game: {
        type: "web",
        link: "https://aaa-trsh.itch.io/rpgpg",
        screenshots: [
            path + "HSawTx.gif",
            path + "thumbnail.png",
        ],
    },
    article: {
        summary: "\"Random-PrnG-Play Game\"",
        description: "At the start of each turn, I'll roll 4 dice. Each one will give you action that you can use in battle. Use what you have to save your crew, or they'll get killed by a bunch of imps! \n\nMade in the 2022 GMTK Game Jam",
    },
};
