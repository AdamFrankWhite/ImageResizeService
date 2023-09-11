import Jimp from "jimp";
export const readImage = async (imagePath) => {
    return await Jimp.read(imagePath);
};
