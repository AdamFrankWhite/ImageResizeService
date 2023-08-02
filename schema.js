const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLID,
    GraphQLSchema,
} = require("graphql");

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
                return users.filter((user) => user.id == args.id)[0];
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
