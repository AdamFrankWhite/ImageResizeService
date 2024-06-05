"use strict";
import express from "express";
import multer from "multer";
import * as dotenv from "dotenv";
import cors from "cors";
import { uploadSMLImagesToS3 } from "../utils/uploadSMLImagesToS3.js";
import { updateUserImageArray } from "../utils/updateUserImageArray.js";
import awsServerlessExpress from "aws-serverless-express";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";
dotenv.config();

const app = express();
//use cors library to avoid CORS issues
app.use(cors());
// create express server
const server = awsServerlessExpress.createServer(app);

// create memory storage object, storing image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// express route
app.post("/upload", upload.single("image"), async (req, res) => {
    const user = req.body.user;
    const query_params = req.body.q;
    const file = req.file;
    console.log(req.body);
    console.log("File:");
    console.log(req.file);
    // get file extension
    let ext = req.file.originalname.split(".").pop();

    const acceptedTypes = [
        "image/jpeg",
        "image/bmp",
        "image/tiff",
        "image/png",
        "image/gif",
    ];
    // validation
    let fileSize = req.file.size;
    if (fileSize > 10485760) {
        return res.json({ message: "Error. File must be under 10mb" });
    }
    // validate filename
    // TODO - sanitise input and validate

    // check filename length
    if (req.file.originalname.length > 30) {
        return res.json({ message: "Error. Filename" });
    }
    console.log(file);
    // file type validation
    let validationData = await fileTypeFromBuffer(file.buffer);
    console.log(validationData);
    if (!acceptedTypes.includes(validationData.mime)) {
        console.log("Error. File type not supported");
        return res.json({ message: "Error. File type not supported" });
    }
    // change blob files to correct ext
    const fileExtensionMap = {
        "image/jpeg": "jpg",
        "image/bmp": "bmp",
        "image/tiff": "tiff",
        "image/png": "png",
        "image/gif": "gif",
    };

    // add correct ext from blob
    if (ext === "blob") {
        ext = fileExtensionMap[validationData.mime];
    }
    // generate random file name
    let filename = randomUUID() + "." + ext;
    // image params
    const params = {
        Bucket: "dino-image-library",
        Key: filename,
        Body: file.buffer,
        ContentType: validationData.mime,
    };

    // new s3 command
    try {
        let message;
        message = await uploadSMLImagesToS3(
            params,
            file,
            filename,
            query_params
        );
        // separate concerns - microservices architecture
        //message = await updateUserImageArray(user, file, filename);
        let statusCode = message.result == "success" ? 200 : 500;

        res.json({
            statusCode,
            body: {
                message,
                imageData: {
                    imageUrl: `https://dino-image-library.s3.eu-west-2.amazonaws.com/${filename}`,

                    filename: filename,
                    fileType: validationData.mime,
                },
            },
            // input: event,
        });
    } catch (e) {
        if (e) {
            res.json({
                statusCode: 500,
                body: JSON.stringify(
                    {
                        message: "Error",
                        // input: event,
                    },
                    null,
                    2
                ),
            });
        }
    }
});

export const handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
};
