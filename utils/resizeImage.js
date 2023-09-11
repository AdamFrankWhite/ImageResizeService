import Jimp from "jimp";

export const resizeImage = async (image, divisor) => {
    let resizedImage = await image.resize(
        parseInt(originalImage.bitmap.width / divisor),
        parseInt(originalImage.bitmap.height / divisor)
    );
    return await resizedImage.getBufferAsync(Jimp.AUTO);
};
