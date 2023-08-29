import Jimp from "jimp";
import "dotenv/config";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
export const handler = async (event) => {
    let params = event.queryStringParameters;
    let filename = params.f;
    let width = params.w;
    let height = params.h;
    let quality = params.q;

    // set appropriate image size file
    let imageToRead = `https://dino-image-library.s3.eu-west-2.amazonaws.com/${filename}`;
    // read iamge
    let originalImage = await Jimp.read(imageToRead);
    let resizedImage = await originalImage
        .resize(parseInt(width), parseInt(height)) // resize
        .quality(parseInt(quality) || 90);
    // .getBase64Async(Jimp.AUTO);
    const resizedBuffer = await resizedImage.getBufferAsync(Jimp.AUTO);
    // Define the table name
    const tableName = "ResizeServiceTable";

    // Define the partition key and sort key values
    // const partitionKey = req.body.user; // Replace with actual partition key value
    // Create a DynamoDB client instance
    const dynamodbClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
    });

    // TODO - add dynamic username, however don't really wanna pass through query strings
    // Construct the update command
    const updateCommand = new UpdateItemCommand({
        TableName: tableName,
        Key: { USER: { S: "123" } },
        ExpressionAttributeValues: { ":inc": { N: "1" } },
        UpdateExpression: "ADD #fileResizeRequestCount :inc",
        ExpressionAttributeNames: {
            "#fileResizeRequestCount": "fileResizeRequestCount",
        },
    });

    try {
        console.log("yo");
        const result = await dynamodbClient.send(updateCommand);

        // update graphql mutation
        console.log("Item updated successfully:", result);
    } catch (error) {
        console.error("Error updating item:", error);
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": originalImage._originalMime,
            "Content-Encoding": "base64",
        },
        body: resizedBuffer.toString("base64"),

        isBase64Encoded: true,
    };
};
