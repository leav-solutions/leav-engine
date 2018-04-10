import {config} from '../../config';

export async function getGraphQLUrl() {
    const conf = await config;

    return `http://${conf.server.host}:${conf.server.port}/graphql`;
}
