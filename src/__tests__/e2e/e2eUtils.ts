import axios from 'axios';
import {config} from '../../config';

async function _getAuthToken() {
    const conf: any = await config;

    return conf.auth.token;
}

async function _getGraphQLUrl() {
    const conf: any = await config;

    return `http://${conf.server.host}:${conf.server.port}/graphql`;
}

export async function makeGraphQlCall(query: string): Promise<any> {
    const url = await _getGraphQLUrl();
    const token = await _getAuthToken();

    return axios.post(url, {query}, {headers: {Authorization: token}});
}
