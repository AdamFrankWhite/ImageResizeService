import { resizeImage } from "../utils/resizeImage";
import { readImage } from "../utils/readImage";
import Jimp from "jimp";

const testImage = async (width, height) => {
    // read image from S3
    const image = await readImage(
        "https://dino-image-library.s3.eu-west-2.amazonaws.com/night-2168868_1280.png"
    );

    // perform resize
    const resizedImage = await resizeImage(image, width, height);
    // get resizedImage dimensions
    new Jimp(resizedImage, function (err, image) {
        var w = image.bitmap.width; //  width of the image
        var h = image.bitmap.height; // height of the image
        expect(w).toBe(width);
        expect(h).toBe(height);
    });
};
test("resized image has width 100, height 100", async () => {
    await testImage(100, 100);
});

test("resized image has width 200, height 200", async () => {
    await testImage(200, 200);
});

test("resized image has width 300, height 300", async () => {
    await testImage(300, 300);
});

test("resized image has width 1000, height 1000", async () => {
    await testImage(1000, 1000);
});

test("resized image has width 1, height 1", async () => {
    await testImage(1, 1);
});
