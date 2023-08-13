import Jimp from "jimp";
export const handler = async (event) => {
    let image = event.queryStringParameters;
    let originalImage = await Jimp.read(image.imagePath);
    let resizedImage = await originalImage
        .resize(parseInt(image.imageWidth), parseInt(image.imageHeight)) // resize
        .quality(90);
    // .getBase64Async(Jimp.AUTO);
    const resizedBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
    console.log();
    return {
        statusCode: 200,
        headers: {
            "Content-Type": originalImage._originalMime,
            "Content-Encoding": "base64",
        },
        body: resizedBuffer.toString("base64"),

        isBase64Encoded: true,
    };

    // return {
    //     statusCode: 200,

    //     body: JSON.stringify({ message: "yo yo!", input: event }),
    // };
};
