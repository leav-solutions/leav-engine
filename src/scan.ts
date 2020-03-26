import walk from 'walk';
import fs from 'fs';
import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloLink} from 'apollo-link';
import {InMemoryCache} from 'apollo-cache-inmemory';
import config from './config';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import {IFullTreeContent} from './types';
import xxh from 'xxhashjs';

const _createHashFromFile = (path: string): string => {
    const buf: Buffer = fs.readFileSync(path);
    return xxh
        .h32(0)
        .update(buf)
        .digest()
        .toString(16)
        .toUpperCase();
};

const filesystem = async (): Promise<any[]> => {
    const conf = await config;
    let data = [];

    const options = {
        followLinks: false,
        listeners: {
            directories: async (root, dirStatsArray, next) => {
                for (const dsa of dirStatsArray) {
                    dsa.path = root.replace(`${conf.filesystem.absolutePath}`, '').slice(1) || '.';
                    dsa.level = dsa.path === '.' ? 0 : dsa.path.split('/').length;
                    dsa.trt = false;
                }

                data = data.concat(dirStatsArray);
                next();
            },
            file: async (root, fileStats, next) => {
                fileStats.hash = await _createHashFromFile(root + '/' + fileStats.name);
                fileStats.path = root.replace(`${conf.filesystem.absolutePath}`, '').slice(1) || '.';
                fileStats.level = fileStats.path === '.' ? 0 : fileStats.path.split('/').length;
                fileStats.trt = false;
                data.push(fileStats);
                next();
            }
            // TODO: errors handling
            // errors: (root, nodeStatsArray, next) => {
            //     next();
            // }
        }
    };

    walk.walkSync(conf.filesystem.absolutePath, options);

    return data;
};

const database = async (): Promise<IFullTreeContent> => {
    const conf = await config;

    const httpLink = createHttpLink({uri: conf.graphql.uri, fetch});
    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext({
            headers: {
                authorization: conf.graphql.token
            }
        });
        return forward(operation);
    });

    const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache()
    });

    const result = await client.query({
        query: gql`
            {
                fullTreeContent(treeId: "files_tree")
            }
        `
    });

    return result.data.fullTreeContent;
};

export default {filesystem, database};
