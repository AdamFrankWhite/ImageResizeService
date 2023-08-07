import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import "dotenv/config";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const port = process.env.PORT;

const dynamoDBClient = new DynamoDBClient({ region: "eu-west-2" });
// const docClient = DynamoDBDocumentClient.from(client);
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
        user(id: String!): User
      }
    
      type User {
          id: String
          username: String
          email: String
          password: String
          date_created: String
          images: [String]
      }
    
      type Image {
          imageID: String
          s3URIs: [String]
          filename: String
          fileType: String
          width: Int
          height: Int
          compressed: Boolean
          compressedPercent: Int
    
      }
    
     
`;

const resolvers = {
    Query: {
        async user(parent, args, contextValue, info) {
            console.log("ID: " + args.id);

            // const command = new GetCommand({
            //     TableName: "ResizeServiceTable",
            //     User: {
            //         N: args.id,
            //     },
            // });

            const params = {
                TableName: "ResizeServiceTable", // Replace "YourTableName" with the name of your DynamoDB table
                Key: {
                    // Define your primary key attributes and values here
                    USER: { S: "123" }, // Replace "PartitionKey" and "123" with your actual values
                    // Optionally, add Sort Key attributes
                    // SortKey: { S: "some-sort-value" }, // Replace "SortKey" and "some-sort-value" with your actual values
                },
            };

            // Create a GetItemCommand
            const command = new GetItemCommand(params);

            // Execute the command and handle the response
            return dynamoDBClient
                .send(command)
                .then((data) => {
                    console.log("Item retrieved:", data.Item);

                    // MAP ITEM TODO
                    let userObj = {
                        id: parseInt(data.Item.USER.S),
                        username: data.Item.username.S,
                        email: data.Item.email.S,
                        password: "bla",
                        date_created: "meh",
                        images: data.Item.images.L,
                    };
                    let userImages = data.Item.images.L;
                    userObj.images = userImages.map((img) => img.S);
                    let user = userObj;
                    console.log(user);
                    return user;
                })
                .catch((error) => {
                    console.error("Error retrieving item:", error);
                });
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 5000 },
});

console.log(`🚀  Server ready at: ${url}`);
