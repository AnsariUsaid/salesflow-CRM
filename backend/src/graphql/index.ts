import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

async function createApolloGraphqlServer() {
  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start the gql server
  await gqlServer.start();

  return gqlServer;
}

export default createApolloGraphqlServer;
