import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { readImage } from "./readImage.js";
import { resizeImage } from "./resizeImage.js";
import * as dotenv from "dotenv";
dotenv.config();
// create s3 instance using S3Client
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

export const uploadSMLImagesToS3 = async (
    params,
    file,
    filename,
    query_params
) => {
    try {
        // upload original image
        const command = new PutObjectCommand(params);
        await s3.send(command);
        let image = await readImage(
            `https://d22cjjn8mu3b6d.cloudfront.net/${filename}`
        );
        let imageWidth = image.bitmap.width;
        let imageHeight = image.bitmap.height;
        console.log(image.bitmap.width, image.bitmap.height);
        // resize and save medium image to bucket
        let resizedBufferMedium = await resizeImage(
            image,
            parseInt(imageWidth / 2),
            parseInt(imageHeight / 2)
        );
        const params_med = {
            Bucket: "dino-image-library",
            Key: filename.replace(".", "_m."),
            Body: resizedBufferMedium,
            ContentType: file.mimetype,
        };
        console.log(params_med);
        const command_m = new PutObjectCommand(params_med);
        // save MEDIUM image to S3 bucket
        await s3.send(command_m);

        // SMALL resize
        // read image
        let resizedBufferSmall = await resizeImage(
            image,
            parseInt(imageWidth / 5),
            parseInt(imageHeight / 5)
        );

        const params_s = {
            Bucket: "dino-image-library",
            Key: filename.replace(".", "_s."),
            Body: resizedBufferSmall,
            ContentType: file.mimetype,
        };
        const command_s = new PutObjectCommand(params_s);
        await s3.send(command_s);
        return { result: "success", message: "Image successfully uploaded" };
    } catch (error) {
        return { result: "failure", error };
    }
};
