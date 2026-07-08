import {GraphQLClient} from 'graphql-request';
import {getSdk} from '../_gqlTypes';

export const getAuthenticatedSdk = async (baseUrl: string, login: string, password: string) => {
    const response = await fetch(`${baseUrl}/auth/authenticate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({login, password}),
    });

    const setCookies = response.headers.getSetCookie();
    if (!setCookies.length) {
        throw new Error('No auth cookie received');
    }

    const authCookie = setCookies[0].split(';')[0];

    return getSdk(new GraphQLClient(`${baseUrl}/graphql`, {headers: {Cookie: authCookie}}));
};
