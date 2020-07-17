import walk from 'walk';
import fs from 'fs';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import {ApolloClient, ApolloQueryResult} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloLink, DocumentNode} from 'apollo-link';
import {InMemoryCache, NormalizedCacheObject} from 'apollo-cache-inmemory';
import {FullTreeContent} from './_types/queries';
import {FilesystemContent, FileContent} from './_types/filesystem';
import * as Config from './_types/config';
import * as utils from './utils';

export const getFilePath = (root: string, fsPath: string): string => root.replace(`${fsPath}`, '').slice(1) || '.';
export const getFileLevel = (path: string): number => (path === '.' ? 0 : path.split('/').length);

export const filesystem = ({absolutePath}: Config.Filesystem): Promise<FilesystemContent> =>
    new Promise((resolve, reject) => {
        let data = [];

        const absPathExist = fs.existsSync(absolutePath);
        if (!absPathExist) {
            return reject('Wrong filesystem absolute path');
        }

        const walker = walk.walk(absolutePath, {followLinks: false});

        walker.on('directories', (root: string, directories: FilesystemContent, next: any) => {
            for (const dir of directories) {
                dir.path = getFilePath(root, absolutePath);
                dir.level = getFileLevel(dir.path);
                dir.trt = false;
            }

            data = data.concat(directories);
            next();
        });

        walker.on('file', async (root: string, file: FileContent, next: any) => {
            file.hash = await utils.createHashFromFile(root + '/' + file.name);
            file.path = getFilePath(root, absolutePath);
            file.level = getFileLevel(file.path);
            file.trt = false;

            data.push(file);
            next();
        });

        walker.on('end', () => {
            resolve(data);
        });
    });

export const database = async ({uri, token, treeId}: Config.GraphQL): Promise<FullTreeContent> => {
    const httpLink: ApolloLink = createHttpLink({uri, fetch});

    const authLink: ApolloLink = new ApolloLink((operation, forward) => {
        operation.setContext({
            headers: {
                authorization: token
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

    const result: ApolloQueryResult<any> = await client.query({
        query: getFullTreeContent,
        variables: {treeId}
    });

    return result.data.fullTreeContent;
};
