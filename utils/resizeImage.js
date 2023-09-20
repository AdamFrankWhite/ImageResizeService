import Jimp from "jimp";

export const resizeImage = async (image, width, height) => {
    // check for no input values
    if (!width && !height) {
        return image.getBufferAsync(Jimp.AUTO);
    }
    // provide auto width/height if only one value supplied
    let resizeWidth = width ? width : Jimp.AUTO;
    let resizeHeight = height ? height : Jimp.AUTO;
    // return resized image
    let resizedImage = await image
        .resize(parseInt(resizeWidth), parseInt(resizeHeight))
        .quality(70);
    let imageBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
    return imageBuffer;
};
