// const express = require("express");
// require("dotenv").config();
// const { createHandler } = require("graphql-http/lib/use/express");
// const dynamoose = require("dynamoose");
// const port = process.env.PORT;
// const app = express();
// const schema = require("./schema");
// const data = require("./sampleData");
// const cors = require("cors");
// const users = data.users;
// const images = data.images;

// app.use(cors());
// // app.use(
// //     "/graphql",
// //     graphqlHTTP({
// //         schema,
// //         graphiql: process.env.NODE_ENV == "development",
// //     })
// // );

// app.all(
//     "/graphql",
//     createHandler({ schema, graphiql: process.env.NODE_ENV == "development" })
// );
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

// const { ApolloServer, gql } = require("apollo-server-express");
// // const {
// //     GraphQLUpload,
// //     graphqlUploadExpress, // A Koa implementation is also exported.
// // } = require("graphql-upload");
// const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");
// const graphqlUpload = require("graphql-upload/GraphQLUpload.js");
// const { finished } = require("stream/promises");
// const {
//     ApolloServerPluginLandingPageLocalDefault,
// } = require("apollo-server-core");
// // import { ApolloServer } from "@apollo/server";
// // import AWS from "aws-sdk";
// // import {
// //     startServerAndCreateLambdaHandler,
// //     handlers,
// // } from "@as-integrations/aws-lambda";

// // const typeDefs = `#graphql
// // type Query {
// //     user(id: ID!): User
// //     images: [Image]
// //     hello: String
// //   }

// //   type User {
// //       id: String
// //       username: String
// //       email: String
// //       password: String
// //       date_created: String
// //       images: [Image]
// //   }

// //   type Image {
// //       imageID: String
// //       s3URIs: [String]
// //       filename: String
// //       fileType: FileType
// //       width: Int
// //       height: Int
// //       compressed: Boolean
// //       compressedPercent: Int

// //   }

// //   enum FileType {
// //       jpg
// //       jpeg
// //       png
// //       webp
// //       tiff
// //       eps
// //       svg
// //       gif
// //   }
// // `;

// // const resolvers = {
// //     Query: {
// //         user(parent, args, contextValue, info) {
// //             var params = {
// //                 Key: {
// //                     User: {
// //                         S: args.id,
// //                     },
// //                 },
// //                 TableName: "ResizeServiceTable",
// //             };
// //             var dynamodb = new AWS.DynamoDB();
// //             dynamodb.getItem(params, function (err, data) {
// //                 if (err) console.log(err, err.stack); // an error occurred
// //                 else console.log(data);
// //                 return data;
// //             });
// //         },
// //         hello: () => "world",
// //     },
// // };

// // const server = new ApolloServer({
// //     typeDefs,
// //     resolvers,
// // });

// // // This final export is important!

// // export const graphqlHandler = startServerAndCreateLambdaHandler(
// //     server,
// //     // We will be using the Proxy V2 handler
// //     handlers.createAPIGatewayProxyEventV2RequestHandler()
// // );
