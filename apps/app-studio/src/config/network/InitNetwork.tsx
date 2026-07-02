import {type FunctionComponent, type PropsWithChildren} from 'react';
import {ApolloProvider} from '@apollo/client';
import {useInitAuth} from './useInitAuth';
import {useInitApollo} from '../graphQL/useInitApollo';

export const InitNetwork: FunctionComponent<PropsWithChildren> = ({children}) => {
    const {unauthorizedHandler} = useInitAuth();
    const {client} = useInitApollo(unauthorizedHandler);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
