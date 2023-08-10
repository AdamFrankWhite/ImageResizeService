import Jimp from "jimp";

export const handler = async (event, context) => {
    // need to get image from s3 bucket
    // resize image
    // return/pipe image back to user
    console.log(event.body);
    let image = JSON.parse(event.body);
    console.log(image.imageWidth, image.imageHeight);
    let resizedImage = await Jimp.read(image.imagePath);
    await resizedImage
        .resize(image.imageWidth, image.imageHeight) // resize
        .quality(90)
        .getBase64Async(Jimp.AUTO);
    console.log(resizedImage.bitmap.data);
    return {
        body: JSON.stringify(
            {
                resizedImage: resizedImage.bitmap.data.toString("base64"),
                isBase64Encoded: true,
                input: event,
            },
            null,
            2
        ),
    };
};
