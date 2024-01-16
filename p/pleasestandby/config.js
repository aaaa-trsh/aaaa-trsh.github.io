const id = "pleasestandby";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "thumbnail-360.png",
        origin: "40% 35%",
        transform: "scale(3)",
        filter: "contrast(1.07) brightness(1.2) saturate(1.3)",
    },
    id: id,
    title: "Please Stand By",
    type: "game",
    game: {
        type: "web",
        link: "https://aaa-trsh.itch.io/please-stand-by",
        screenshots: [
            path + "thumbnail.png",
        ],
    },
    article: {
        summary: "The warp core's on fire - its burnt to a crisp!",
        description: "You gotta control this ship yourself, Pilot. It was made for our brand new warp technology, but some interns messed up the design. You can only control one tool at a time because of those fools! \n\nWait, the specimens there too?\nOk. Uhhh feed it some minerals to keep it alive or something.\n\nAlright! Lets get you outta th-\n[ COMMUNICATIONS LOST ]\n\nMade in the 2020 GMTK Game Jam",
    },
};
