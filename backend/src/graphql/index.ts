import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";
import { AuthenticatedUser } from "../lib/auth";

export interface GraphQLContext {
  user?: AuthenticatedUser;
}

async function createApolloGraphqlServer() {
  const gqlServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });

  // Start the gql server
  await gqlServer.start();

  return gqlServer;
}

export default createApolloGraphqlServer;
