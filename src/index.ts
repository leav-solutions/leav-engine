import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloLink} from 'apollo-link';
import {InMemoryCache} from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import {env} from './env';
import config from '../config/development';
import fetch from 'node-fetch';
import scan from './scan';

(async function() {
    scan();

    // const httpLink = createHttpLink({uri: config.graphql.uri, fetch});
    // const authLink = new ApolloLink((operation, forward) => {
    //     operation.setContext({
    //         headers: {
    //             authorization: config.graphql.token
    //         }
    //     });
    //     return forward(operation);
    // });
    // const client = new ApolloClient({
    //     link: authLink.concat(httpLink),
    //     cache: new InMemoryCache()
    // });
    // const result = await client.query({
    //     query: gql`
    //         {
    //             me {
    //                 id
    //             }
    //         }
    //     `
    // });
    // console.log(result);
})().catch(e => console.error(e));
