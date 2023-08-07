import express from "express";
import multer from "multer";
// import multerS3 from "multer-s3";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";
dotenv.config();
// create s3 instance using S3Client
// (this is how we create s3 instance in v3)
module.exports.handler = async (event) => {
    const s3 = new S3Client({
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID, // store it in .env file to keep it safe
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.AWS_REGION, // this is the region that you select in AWS account
    });
    const app = express();
    const port = process.env.port || 4000;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    // create memory storage object, storing image in memory
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    app.post("/upload", upload.single("image"), async (req, res) => {
        // handle upload
        const params = {
            Bucket: "dino-image-library",
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: "File uploaded successfully!",
                    input: event,
                },
                null,
                2
            ),
        };
    });
};
