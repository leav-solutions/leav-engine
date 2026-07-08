import axios from 'axios';
import {GraphQLClient} from 'graphql-request';
import {getSdk} from '../_gqlTypes';

export const getAuthenticatedSdk = async (baseUrl: string, login: string, password: string) => {
    const response = await axios.post(`${baseUrl}/auth/authenticate`, {login, password});

    const setCookies = response.headers['set-cookie'];
    if (!setCookies) {
        throw new Error('No auth cookie received');
    }

    const authCookie = setCookies[0].split(';')[0];

    return getSdk(new GraphQLClient(`${baseUrl}/graphql`, {headers: {Cookie: authCookie}}));
};
