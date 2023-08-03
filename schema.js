const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLID,
    GraphQLSchema,
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
        images: { type: new GraphQLList(ImageType) },
    }),
});

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

    let user = await dynamodb
        .getItem(params, (err, data) => {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                let userObj = {
                    id: parseInt(id),
                    username: data.Item.username.S,
                    email: data.Item.email.S,
                    password: "bla",
                    date_created: "meh",
                    images: [],
                };
                console.log(userObj);
                return userObj;
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
            type: new GraphQLList(ImageType),
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
                let user = getUser(args.id);

                //console.log(users.filter((u) => u.id == args.id)[0]);
                //return user;
                return users.filter((u) => u.id == args.id)[0];
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

module.exports = new GraphQLSchema({
    query: RootQuery,
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
