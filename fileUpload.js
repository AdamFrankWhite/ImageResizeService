"use strict";
import express from "express";
import multer from "multer";
// import multerS3 from "multer-s3";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as dotenv from "dotenv";
import cors from "cors";
import awsServerlessExpress from "aws-serverless-express";
const client = new DynamoDBClient({ region: "eu-west-2" });
dotenv.config();
// create s3 instance using S3Client
// (this is how we create s3 instance in v3)

// Configure AWS credentials and region
const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

// Create a DynamoDB client instance
const dynamodbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    //remove credentials
    // credentials,
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
app.use(cors());
const server = awsServerlessExpress.createServer(app);
// const port = 4000;

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

// create memory storage object, storing image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.post("/upload", upload.single("image"), async (req, res) => {
    // handle upload
    console.log(req.file.mimetype);
    const params = {
        Bucket: "dino-image-library",
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    try {
        await s3.send(command);
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
