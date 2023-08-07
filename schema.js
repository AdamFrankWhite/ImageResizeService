const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLID,
    GraphQLSchema,
    GraphQLSkipDirective,
} = require("graphql");

const AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB();
const TABLE_NAME = "ResizeServiceTable";
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const data = require("./sampleData");
const users = data.users;
const images = data.images;
const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        date_created: { type: GraphQLString },
        images: { type: new GraphQLList(GraphQLString) },
    }),
});
// NEW
// const FileType = new GraphQLObjectType({
//     name: "File",
//     fields: () => ({
//         filename: { type: GraphQLString },
//         mimetype: { type: GraphQLString },
//         encoding: { type: GraphQLString },
//     }),
// });

const ImageType = new GraphQLObjectType({
    name: "Image",
    fields: () => ({
        id: { type: GraphQLID },
        s3URIs: { type: GraphQLString },
        filename: { type: GraphQLString },
        fileType: { type: GraphQLString },
        width: { type: GraphQLInt },
        height: { type: GraphQLInt },
        compressed: { type: GraphQLBoolean },
        compressedPercent: { type: GraphQLInt },
    }),
});

const getUser = async (id) => {
    console.log("ID: " + id);
    const params = {
        TableName: TABLE_NAME,
        Key: {
            USER: {
                S: id,
            },
        },
    };
    //async functions caused issue returning data – got it working
    let user;
    await dynamodb
        .getItem(params, (err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                console.log(data);
                let userObj = {
                    id: parseInt(id),
                    username: data.Item.username.S,
                    email: data.Item.email.S,
                    password: "bla",
                    date_created: "meh",
                    images: data.Item.images.L,
                };
                let userImages = data.Item.images.L;
                userObj.images = userImages.map((img) => img.S);
                user = userObj;
                console.log(user);
            }
        })
        .promise();
    return user;
};

const getImage = async (userID, imageID) => {
    console.log(`userID: ${userID} + imageID ${id}`);
    const params = {
        TableName: TABLE_NAME,
        Key: {
            USER: {
                S: id,
            },
        },
    };
    //async functions caused issue returning data – got it working
    let user;
    await dynamodb
        .getItem(params, (err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                let images = data;
                console.log(images);
                // let imageObjs = images.map(image => {

                // })
                let userObj = {
                    id: parseInt(id),
                    username: data.Item.username.S,
                    email: data.Item.email.S,
                    password: "bla",
                    date_created: "meh",
                    images: data.Item.images.S,
                };
                user = userObj;
            }
        })
        .promise();
    return user;
};
// getUser("123");
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        images: {
            type: new GraphQLList(GraphQLString),
            resolve(parent, args) {
                // return dynamoDB item
                return images;
            },
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                // return dynamoDB item
                return getUser(args.id);
            },
        },
        image: {
            type: ImageType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                // return dynamoDB item
                return images.filter((image) => image.id == args.id);
            },
        },
    },
});
// Mutations
const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
                date_created: { type: GraphQLString },
                images: { type: new GraphQLList(GraphQLString) },
            },
        },
    },
    resolve(parent, args) {
        console.log(args);
        const user = {
            id: parseInt(args.id),
            username: args.username,
            email: args.email,
            password: args.password,
            date_created: args.date_created,
            images: args.images,
        };
        console.log(user);
        return user;
    },
});

// const uploadMutation = new GraphQLObjectType({
//     name: "UploadMutation",
//     fields: {
//         uploadImage: {
//             type: FileType,
//             args: {
//                 id: { type: GraphQLID },
//                 username: { type: GraphQLString },
//                 email: { type: GraphQLString },
//                 password: { type: GraphQLString },
//                 date_created: { type: GraphQLString },
//                 images: { type: new GraphQLList(GraphQLString) },
//             },
//         },
//     },
//     resolve(parent, args) {
//         console.log(args);
//         const user = {
//             id: parseInt(args.id),
//             username: args.username,
//             email: args.email,
//             password: args.password,
//             date_created: args.date_created,
//             images: args.images,
//         };
//         console.log(user);
//         return user;
//     },
// });
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});
// `type Query {
//     user(id: ID!): User
//     images: [Image]
//     hello: String
//   }

//   type User {
//       id: String
//       username: String
//       email: String
//       password: String
//       date_created: String
//       images: [Image]
//   }

//   type Image {
//       imageID: String
//       s3URIs: [String]
//       filename: String
//       fileType: FileType
//       width: Int
//       height: Int
//       compressed: Boolean
//       compressedPercent: Int

//   }

//   enum FileType {
//       jpg
//       jpeg
//       png
//       webp
//       tiff
//       eps
//       svg
//       gif
//   }`;
