const id = "targetdischarge";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "screenshot_6_34-360.png",
        origin: "100% 40%",
        transform: "scale(1.6)",
        filter: "saturate(1.4) brightness(1.2) contrast(.9)",
    },
    id: id,
    title: "Target Discharge",
    type: "game",
    game: {
        type: "web",
        link: "https://globalgamejam.org/2018/games/target-discharge",
        screenshots: [
            path + "screenshot_6_34.png",
            path + "screenshot_8_16.png",
            path + "screenshot_10_10.png",
        ],
    },
    article: {
        summary: "Spread that <span style='background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red); -webkit-background-clip: text; color: #fff4; font-weight: 700;'>funky fever</span>!",
        description: "Featuring Thorsten S. Wiedemann, Target Discharge! You control a parasitic virus thats trying to take over the world! \n\nAlso, the only way it can spread to a new host is through the air (after violent spontanious combustion)  \n\nMade in GGJ 2018",
    },
};
