import Jimp from "jimp";

export const resizeImage = async (image, divisor) => {
    let resizedImage = await image
        .resize(
            parseInt(image.bitmap.width / divisor),
            parseInt(image.bitmap.height / divisor)
        )
        .quality(70);
    let imageBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
    return imageBuffer;
};
