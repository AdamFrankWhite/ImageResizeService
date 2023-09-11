import Jimp from "jimp";
export default readImage = async (imagePath) => {
    return await Jimp.read(imagePath);
};
