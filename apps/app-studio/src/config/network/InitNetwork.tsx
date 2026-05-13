import {type FunctionComponent} from 'react';
import {ApolloProvider} from '@apollo/client';
import {useInitAuth} from './useInitAuth';
import {useInitApollo} from '../graphQL/useInitApollo';

export const InitNetwork: FunctionComponent = ({children}) => {
    const {unauthorizedHandler} = useInitAuth();
    const {client} = useInitApollo(unauthorizedHandler);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
