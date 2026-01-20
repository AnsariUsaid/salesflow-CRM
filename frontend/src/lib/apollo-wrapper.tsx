"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useAuth } from "@clerk/nextjs";
import { apolloClient, setAuthToken } from "./apollo-client";
import { ReactNode, useEffect } from "react";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up the token getter function for Apollo Client
    setAuthToken(getToken);
  }, [getToken]);

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
