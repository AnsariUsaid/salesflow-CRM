import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

const authLink = setContext((_, { headers }) => {
  // Clerk handles auth automatically via cookies
  return {
    headers: {
      ...headers,
    }
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
