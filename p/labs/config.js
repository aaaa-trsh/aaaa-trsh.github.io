const id = "labs";
const path = `./projects/${id}/`;

export default {
    thumbnail: {
        image: path + "thumbnail-360.png",
        origin: "50% 60%",
        transform: "scale(2.3)",
        filter: "contrast(.9) brightness(1)",
    },
    id: id,
    title: "Wave Function Labs",
    type: "misc",
};
