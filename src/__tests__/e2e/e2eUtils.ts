import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import {config} from '../../config';

async function _getAuthToken() {
    const conf: any = await config;

    const token = jwt.sign(
        {
            userId: '1',
            login: 'admin',
            role: 'admin'
        },
        conf.auth.key,
        {
            algorithm: conf.auth.algorithm,
            expiresIn: conf.auth.tokenExpiration
        }
    );

    return token;
}

async function _getGraphQLUrl() {
    const conf: any = await config;

    return `http://${conf.server.host}:${conf.server.port}/graphql`;
}

export async function makeGraphQlCall(query: string): Promise<any> {
    try {
        const url = await _getGraphQLUrl();
        const token = await _getAuthToken();

        const res = await axios.post(url, {query}, {headers: {Authorization: token}});

        return res;
    } catch (e) {
        console.error('GraphQL query error:', e.message, '\n', e.response.data);
    }
}
