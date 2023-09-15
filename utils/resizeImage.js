import Jimp from "jimp";

export const resizeImage = async (image, width, height) => {
    let resizedImage = await image
        .resize(parseInt(width), parseInt(height))
        .quality(70);
    let imageBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
    return imageBuffer;
};
