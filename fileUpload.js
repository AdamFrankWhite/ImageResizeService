"use strict";
import express from "express";
import multer from "multer";
import Jimp from "jimp";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";
import cors from "cors";
import awsServerlessExpress from "aws-serverless-express";
dotenv.config();
// create s3 instance using S3Client
// Create a DynamoDB client instance
const dynamodbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
});

// export const handler = async (event) => {
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});
const app = express();
//use cors library to avoid CORS issues
app.use(cors());
const server = awsServerlessExpress.createServer(app);

// create memory storage object, storing image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.post("/upload", upload.single("image"), async (req, res) => {
    // image params
    const params = {
        Bucket: "dino-image-library",
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };
    // new s3 command
    const command = new PutObjectCommand(params);
    try {
        // send original image
        await s3.send(command);

        // resize and save medium image to bucket
        let imageToRead = `https://dino-image-library.s3.eu-west-2.amazonaws.com/${req.file.originalname}`;
        let originalImage = await Jimp.read(imageToRead);
        let resizedImage = await originalImage.resize(
            parseInt(originalImage.bitmap.width / 2),
            parseInt(originalImage.bitmap.height / 2)
        );
        const resizedBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
        const params_med = {
            Bucket: "dino-image-library",
            Key: req.file.originalname.replace(".", "_m."),
            Body: resizedBuffer,
            ContentType: req.file.mimetype,
        };
        const command_m = new PutObjectCommand(params_med);
        // save MEDIUM image to S3 bucket
        await s3.send(command_m);

        // SMALL resize
        // read image
        let resizedImageS = await originalImage.resize(
            parseInt(originalImage.bitmap.width / 5),
            parseInt(originalImage.bitmap.height / 5)
        ); // resize

        const resizedBufferS = await resizedImageS.getBufferAsync(Jimp.AUTO);
        const params_s = {
            Bucket: "dino-image-library",
            Key: req.file.originalname.replace(".", "_s."),
            Body: resizedBufferS,
            ContentType: req.file.mimetype,
        };
        const command_s = new PutObjectCommand(params_s);
        await s3.send(command_s);
        // update dynamodb
        console.log(req.body.user);
        const tableName = "ResizeServiceTable";

        const partitionKey = req.body.user;

        const newImageItem = {
            imageUrl: {
                S: `https://dino-image-library.s3.eu-west-2.amazonaws.com/${req.file.originalname}`,
            },
            filename: { S: req.file.originalname },
            fileType: { S: req.file.mimetype },
        };
        // update command
        console.log("bla");
        // update images list attribute
        const updateCommand = new UpdateItemCommand({
            TableName: tableName,
            Key: { USER: { S: partitionKey } },
            UpdateExpression: "SET #images = list_append(#images, :newImage)",
            ExpressionAttributeNames: {
                "#images": "images",
            },
            ExpressionAttributeValues: {
                ":newImage": { L: [{ M: newImageItem }] },
            },
        });

        try {
            const result = await dynamodbClient.send(updateCommand);

            console.log("Item updated successfully:", result);
        } catch (error) {
            console.error("Error updating item:", error);
        }

        res.json({
            statusCode: 200,
            body: {
                message: "File uploaded successfully!",
                imageData: {
                    imageUrl: `https://dino-image-library.s3.eu-west-2.amazonaws.com/${req.file.originalname}`,

                    filename: req.file.originalname,
                    fileType: req.file.mimetype,
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

// app.delete("/remove", async (req, res) => {
//     // handle upload
//     const params = {
//         Bucket: "dino-image-library",
//         Key: req.file.originalname,
//         Body: req.file.buffer,
//         ContentType: req.file.mimetype,
//     };
//     const command = new DeleteObjectCommand(params);
//     try {
//         await s3.send(command);
//         // update dynamodb
//         console.log(req.body.user);
//         // Define the table name
//         const tableName = "ResizeServiceTable";

//         // Define the partition key and sort key values
//         const partitionKey = req.body.user; // Replace with actual partition key value

//         // Define the new image item to add to the list
//         const newImageItem = {
//             imageUrl: {
//                 S: `https://dino-image-library.s3.eu-west-2.amazonaws.com/${req.file.originalname}`,
//             },
//             filename: { S: req.file.originalname },
//             fileType: { S: req.file.mimetype },
//         };
//         // Construct the update command
//         const updateCommand = new UpdateItemCommand({
//             TableName: tableName,
//             Key: { USER: { S: partitionKey } },
//             UpdateExpression: "SET #images = list_append(#images, :newImage)",
//             ExpressionAttributeNames: {
//                 "#images": "images",
//             },
//             ExpressionAttributeValues: {
//                 ":newImage": { L: [{ M: newImageItem }] },
//             },
//         });

//         // Update the images list attribute

//         try {
//             const result = await dynamodbClient.send(updateCommand);
//             console.log("Item deleted successfully:", result);
//         } catch (error) {
//             console.error("Error updating item:", error);
//         }

//         res.json({
//             statusCode: 200,
//             body: JSON.stringify({
//                 message: "File deleted successfully!",
//                 // input: event,
//             }),
//         });
//     } catch (e) {
//         if (e) {
//             res.json({
//                 statusCode: 500,
//                 body: JSON.stringify(
//                     {
//                         message: "Error",
//                     },
//                     null,
//                     2
//                 ),
//             });
//         }
//     }
// });
export const handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
};
