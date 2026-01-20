"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// This function will be called on the client side to get the token
let getTokenFunction: (() => Promise<string | null>) | null = null;

export function setAuthToken(getToken: () => Promise<string | null>) {
  getTokenFunction = getToken;
}

// Create an auth link that adds the token to every request
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Clerk if available
  const token = getTokenFunction ? await getTokenFunction() : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql",
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
