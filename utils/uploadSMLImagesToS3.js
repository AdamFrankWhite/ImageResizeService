import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import readImage from "../utils/readImage";
import resizeImage from "../utils/resizeImage";
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

export const uploadSMLImagesToS3 = async (params, file) => {
    // upload original image
    const command = new PutObjectCommand(params);
    await s3.send(command);
    let image = readImage(
        `https://dino-image-library.s3.eu-west-2.amazonaws.com/${file.originalname}`
    );

    // resize and save medium image to bucket
    let resizedBufferMedium = resizeImage(image, 2);
    const params_med = {
        Bucket: "dino-image-library",
        Key: file.originalname.replace(".", "_m."),
        Body: resizedBufferMedium,
        ContentType: file.mimetype,
    };
    const command_m = new PutObjectCommand(params_med);
    // save MEDIUM image to S3 bucket
    await s3.send(command_m);

    // SMALL resize
    // read image
    let resizedBufferSmall = resizeImage(image, 5);

    const params_s = {
        Bucket: "dino-image-library",
        Key: file.originalname.replace(".", "_s."),
        Body: resizedBufferSmall,
        ContentType: file.mimetype,
    };
    const command_s = new PutObjectCommand(params_s);
    await s3.send(command_s);
};
