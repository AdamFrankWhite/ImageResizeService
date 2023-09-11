import Jimp from "jimp";

export const readImage = async (imagePath) => {
    let image = await Jimp.read(imagePath);
    return image;
};
