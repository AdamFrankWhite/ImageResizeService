import { ApolloServer } from "@apollo/server";
import {
    startServerAndCreateLambdaHandler,
    handlers,
} from "@as-integrations/aws-lambda";
import "dotenv/config";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
    DynamoDBClient,
    UpdateItemCommand,
    GetItemCommand,
    PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});
const dynamoDBClient = new DynamoDBClient({ region: "eu-west-2" });
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  
    type Query {
        user(id: String!, token: String): User
      }
    
      type User {
          id: String
          username: String
          email: String
          password: String
          date_created: String
          images: [Image]
          fileResizeRequestCount: Int
          token: String
      }
    
      type Image {
          imageID: String
          imageUrl: String
          filename: String
          fileType: String
          width: Int
          height: Int
          compressed: Boolean
          compressedPercent: Int
    
      }

      
      type Mutation {
        deleteImage(id: String!, filename: String!, token: String!): User
      }

      type Mutation {
        createUser(username: String!, password: String!): User
      }
     
      type Mutation {
        login(username: String!, password: String!): User
        
      }

      
    
     
`;

// RESOLVERS
const resolvers = {
    Query: {
        async user(parent, args, contextValue, info) {
            let token = args.token;
            let secretKey = process.env.JWT_SECRET_KEY;
            // verify token
            let loginVerified = false;
            jwt.verify(token, secretKey, (error, decoded) => {
                if (error) {
                    console.log("Login failed");
                    return error.message;
                } else {
                    loginVerified = true;
                }
            });
            if (!loginVerified) {
                return "Authentication failed";
            }
            const params = {
                TableName: "ResizeServiceTable",
                Key: {
                    USER: { S: args.id },
                },
            };

            // create command
            const command = new GetItemCommand(params);

            // execute command/handle response
            return dynamoDBClient
                .send(command)
                .then((data) => {
                    // console.log("Item retrieved:", data.Item);

                    // MAP ITEM TODO - extract out
                    let userObj = {
                        username: data.Item.USER.S,
                        password: "bla",
                        date_created: "meh",
                        images: data.Item.images.L,
                        filesUploadCount: data.Item.filesUploadCount.N,
                        fileResizeRequestCount:
                            data.Item.fileResizeRequestCount.N,
                    };
                    let userImages = data.Item.images.L;
                    userObj.images = userImages.map((img) => {
                        return {
                            filename: img.M.filename.S,
                            imageUrl: img.M.imageUrl.S,
                            fileType: img.M.fileType.S,
                        };
                    });
                    let user = userObj;
                    console.log(user);
                    return user;
                })
                .catch((error) => {
                    console.error("Error retrieving item:", error);
                });
        },
    },
    Mutation: {
        async deleteImage(parent, args, contextValue, info) {
            let id = args.id;
            let token = args.token;
            let filename = args.filename;
            const params = {
                TableName: "ResizeServiceTable",
                Key: {
                    USER: { S: id },
                },
            };

            //DELETE FROM S3 BUCKET
            try {
                const bucketParams = {
                    Bucket: "dino-image-library",
                    Key: filename,
                };
                const bucketParams_m = {
                    Bucket: "dino-image-library",
                    Key: filename.replace(".", "_m."),
                };
                const bucketParams_s = {
                    Bucket: "dino-image-library",
                    Key: filename.replace(".", "_s."),
                };
                await s3.send(new DeleteObjectCommand(bucketParams));
                await s3.send(new DeleteObjectCommand(bucketParams_m));
                await s3.send(new DeleteObjectCommand(bucketParams_s));
                console.log("Success. Object deleted.");
                // return data; // For unit tests.
            } catch (err) {
                console.log("Error", err);
            }

            // DELETE FROM DYNAMODB
            // create command
            const command = new GetItemCommand(params);

            // execute command/handle response
            let filteredArray = await dynamoDBClient
                .send(command)
                .then((data) => {
                    // console.log("Item retrieved:", data.Item);

                    // MAP ITEM TODO - extract out
                    let imagesArray = data.Item.images.L;

                    return imagesArray.filter(
                        (item) => item.M.filename.S != filename
                    );
                })
                .catch((error) => {
                    console.error("Error retrieving item:", error);
                });

            const updateCommand = new UpdateItemCommand({
                TableName: "ResizeServiceTable",
                Key: { USER: { S: id } },
                UpdateExpression: "SET images = :updatedList",

                ExpressionAttributeValues: {
                    ":updatedList": { L: filteredArray },
                },
            });

            try {
                const result = await dynamoDBClient.send(updateCommand);

                console.log("Item updated successfully:", result);
                return filteredArray;
            } catch (error) {
                console.error("Error updating item:", error);
            }
        },
        async createUser(parent, args, contextValue, info) {
            let username = args.username;
            let password = args.password;
            // hash password
            let salt = crypto.randomBytes(16).toString("hex");

            // Hashing user's salt and password with 1000 iterations,
            let hash = crypto
                .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
                .toString(`hex`);
            // save to dynamoDb
            console.log(hash);
            const item = {
                TableName: "ResizeServiceTable",
                Item: {
                    // Specify the attributes of the item
                    USER: { S: username },
                    password: { S: hash },
                    salt: { S: salt },
                    images: { L: [] },
                    fileResizeRequestCount: { N: "0" },
                    filesUploadCount: { N: "0" },
                },
            };
            const putItemCommand = new PutItemCommand(item);
            try {
                const response = await dynamoDBClient.send(putItemCommand);
                console.log("Item added:", response);
            } catch (error) {
                console.error("Error adding item:", error);
            }
        },
        async login(parent, args, contextValue, info) {
            let username = args.username;
            let password = args.password;

            const params = {
                TableName: "ResizeServiceTable",
                Key: {
                    USER: { S: username },
                },
            };

            // create command
            const command = new GetItemCommand(params);
            let user = {};
            // execute command/handle response
            let validPassword = await dynamoDBClient
                .send(command)
                .then((data) => {
                    // console.log("Item retrieved:", data.Item);

                    // MAP ITEM TODO - extract out
                    let storedPassword = data.Item.password.S;
                    let salt = data.Item.salt.S;
                    // hash password
                    var hashedPassword = crypto
                        .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
                        .toString(`hex`);
                    let userObj = {
                        username: data.Item.USER.S,
                        // username: data.Item.username.S,
                        // email: data.Item.email.S,
                        // password: "bla",
                        date_created: "meh",
                        images: data.Item.images.L.map((item) => {
                            return {
                                fileType: item.M.fileType.S,
                                imageUrl: item.M.imageUrl.S,
                                filename: item.M.filename.S,
                            };
                        }),
                        filesUploadCount: data.Item.filesUploadCount.N,
                        fileResizeRequestCount:
                            data.Item.fileResizeRequestCount.N,
                    };
                    // Check stored password
                    console.log(hashedPassword == storedPassword);
                    if (hashedPassword == storedPassword) {
                        user = userObj;
                        // generate session key
                        let secretKey = process.env.JWT_SECRET_KEY;
                        const options = {
                            expiresIn: "3h", // Token expiration time
                        };

                        const token = jwt.sign(user, secretKey, options);
                        user.token = token;
                        console.log(user.token);
                    } else {
                        return "wrong password";
                    }
                    console.log(user);
                })
                .catch((error) => {
                    console.error("Error retrieving item:", error);
                });
            return user;
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
    server,
    // We will be using the Proxy V2 handler
    handlers.createAPIGatewayProxyEventV2RequestHandler()
);
