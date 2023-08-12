import Jimp from "jimp";

export const handler = async (event) => {
    // need to get image from s3 bucket
    // resize image
    // return/pipe image back to user

    let image = event.queryStringParameters;
    let originalImage = await Jimp.read(image.imagePath);

    let resizedImage = await originalImage
        .resize(parseInt(image.imageWidth), parseInt(image.imageHeight)) // resize
        .quality(90);
    // .getBase64Async(Jimp.AUTO);
    const resizedBuffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);
    console.log(resizedBuffer.toString("base64"));
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "image/png",
        },
        body: JSON.stringify(resizedBuffer.toString("base64")),

        isBase64Encoded: true,
    };
};
