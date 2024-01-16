const id = "groupthink";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "kYynSw-360.png",
        origin: "53% 52%",
        transform: "scale(-2.4, 2.4) rotateZ(-5deg)",
        filter: "saturate(1.13) blur(.2px)",
    },
    id: id,
    title: "group<wbr>THINK",
    type: "game",
    game: {
        type: "web",
        link: "https://aaa-trsh.itch.io/groupthink",
        screenshots: [
            path + "_jjJ1o.png",
            path + "iGFyzO.png",
            path + "kYynSw.png",
            path + "KSrqd3.png",
        ],
    },
    article: {
        summary: "RUN!!",
        description: "Run away from big mob.\n\nMade in GGJ Next 2019",
    },
};
