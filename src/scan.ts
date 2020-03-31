import walk from 'walk';
import fs from 'fs';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloLink} from 'apollo-link';
import {InMemoryCache} from 'apollo-cache-inmemory';
import config from './config';
import {FullTreeContent} from './_types/queries';
import {FilesystemContent, FileContent} from './_types/filesystem';
import {Config} from './_types/config';
import crypto from 'crypto';

const _createHashFromFile = (filePath: string): Promise<string> =>
    new Promise(resolve => {
        const hash = crypto.createHash('md5');
        fs.createReadStream(filePath)
            .on('data', data => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')));
    });

export const filesystem = async (): Promise<FilesystemContent> => {
    const conf: Config = await config;
    let data = [];

    const options = {
        followLinks: false,
        listeners: {
            directories: (root: any, dirStatsArray: FilesystemContent, next: any) => {
                for (const dsa of dirStatsArray) {
                    dsa.path = root.replace(`${conf.filesystem.absolutePath}`, '').slice(1) || '.';
                    dsa.level = dsa.path === '.' ? 0 : dsa.path.split('/').length;
                    dsa.trt = false;
                }

                data = data.concat(dirStatsArray);
                next();
            },
            file: async (root: any, fileStats: FileContent, next: any) => {
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

export const database = async (): Promise<FullTreeContent> => {
    try {
        const conf: Config = await config;

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

        // const getFullTreeContent = gql`
        //     query GET_FULL_TREE_CONTENT($treeId: String!) {
        //         fullTreeContent(treeId: $treeId)
        //     }
        // `;

        // const result = await client.query({
        //     query: getFullTreeContent,
        //     variables: {treeId: conf.graphql.treeId}
        // });

        return result.data.fullTreeContent;
    } catch (e) {
        throw e;
    }
};
