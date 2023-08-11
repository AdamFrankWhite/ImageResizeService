import Jimp from "jimp";

export const handler = async (event, context) => {
    // need to get image from s3 bucket
    // resize image
    // return/pipe image back to user
    console.log(event.body);
    let image = JSON.parse(event.body);
    let originalImage = await Jimp.read(image.imagePath);
    // Convert the resized image to a buffer
    console.log(
        "Original image dimensions:",
        originalImage.getWidth(),
        originalImage.getHeight()
    );

    let resizedImage = await originalImage
        .resize(image.imageWidth, image.imageHeight) // resize
        .quality(90);
    // .getBase64Async(Jimp.AUTO);
    const resizedBuffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);

    console.log(
        "Resized image dimensions:",
        resizedImage.getWidth(),
        resizedImage.getHeight()
    );
    console.log("Resized buffer length:", resizedBuffer.length);
    return {
        status: 200,
        headers: {
            "Content-Type": "image/png",
        },
        body: JSON.stringify(resizedBuffer.toString("base64")),
        isBase64Encoded: true,
    };
};
