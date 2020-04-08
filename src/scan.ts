import walk from 'walk';
import fs from 'fs';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloLink, DocumentNode} from 'apollo-link';
import {InMemoryCache, NormalizedCacheObject} from 'apollo-cache-inmemory';
import {FullTreeContent} from './_types/queries';
import {FilesystemContent, FileContent} from './_types/filesystem';
import crypto from 'crypto';
import {Config} from './_types/config';

const _createHashFromFile = (filePath: string): Promise<string> =>
    new Promise(resolve => {
        const hash = crypto.createHash('md5');
        fs.createReadStream(filePath)
            .on('data', data => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')));
    });

export const filesystem = (cfg: Config): Promise<FilesystemContent> =>
    new Promise(resolve => {
        let data = [];

        const walker = walk.walk(cfg.filesystem.absolutePath, {followLinks: false});

        walker.on('directories', (root: any, dirStatsArray: FilesystemContent, next: any) => {
            for (const dsa of dirStatsArray) {
                dsa.path = root.replace(`${cfg.filesystem.absolutePath}`, '').slice(1) || '.';
                dsa.level = dsa.path === '.' ? 0 : dsa.path.split('/').length;
                dsa.trt = false;
            }

            data = data.concat(dirStatsArray);
            next();
        });

        walker.on('file', async (root: any, fileStats: FileContent, next: any) => {
            fileStats.hash = await _createHashFromFile(root + '/' + fileStats.name);
            fileStats.path = root.replace(`${cfg.filesystem.absolutePath}`, '').slice(1) || '.';
            fileStats.level = fileStats.path === '.' ? 0 : fileStats.path.split('/').length;
            fileStats.trt = false;
            data.push(fileStats);
            next();
        });

        walker.on('end', () => {
            resolve(data);
        });
    });

export const database = async (cfg: Config): Promise<FullTreeContent> => {
    try {
        const httpLink = createHttpLink({uri: cfg.graphql.uri, fetch});
        const authLink = new ApolloLink((operation, forward) => {
            operation.setContext({
                headers: {
                    authorization: cfg.graphql.token
                }
            });
            return forward(operation);
        });

        const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache()
        });

        const getFullTreeContent: DocumentNode = gql`
            query GET_FULL_TREE_CONTENT($treeId: ID!) {
                fullTreeContent(treeId: $treeId)
            }
        `;

        const result = await client.query({
            query: getFullTreeContent,
            variables: {treeId: cfg.graphql.treeId}
        });

        return result.data.fullTreeContent;
    } catch (e) {
        throw e;
    }
};
