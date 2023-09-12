import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";
dotenv.config();
export const updateUserImageArray = async (user, file) => {
    // Create a DynamoDB client instance
    const dynamodbClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
    });
    // update dynamodb
    console.log(user);
    const tableName = "ResizeServiceTable";

    const partitionKey = user;

    const newImageItem = {
        imageUrl: {
            S: `https://dino-image-library.s3.eu-west-2.amazonaws.com/${file.originalname}`,
        },
        filename: { S: file.originalname },
        fileType: { S: file.mimetype },
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

        return { result: "success", message: result };
    } catch (error) {
        return { result: "failure", message: "Failed to update user" };
    }
};
