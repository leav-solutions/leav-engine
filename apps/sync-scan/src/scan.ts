// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache, NormalizedCacheObject} from 'apollo-cache-inmemory';
import {ApolloClient, ApolloQueryResult} from 'apollo-client';
import {ApolloLink, DocumentNode} from 'apollo-link';
import {createHttpLink} from 'apollo-link-http';
import fs from 'fs';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import walk from 'walk';
import * as utils from './utils';
import {IConfig} from './_types/config';
import {FilesystemContent, IFileContent} from './_types/filesystem';
import {FullTreeContent} from './_types/queries';
import {isFileAllowed} from '@leav/utils';

export const getFilePath = (root: string, fsPath: string): string => root.replace(`${fsPath}`, '').slice(1) || '.';
export const getFileLevel = (path: string): number => (path === '.' ? 0 : path.split('/').length);

export const filesystem = ({filesystem: fsys, allowFilesList, ignoreFilesList}: IConfig): Promise<FilesystemContent> =>
    new Promise((resolve, reject) => {
        let data = [];

        if (!fs.existsSync(fsys.absolutePath)) {
            return reject('Wrong filesystem absolute path');
        }

        const SEPARATOR_CHARACTERS = ', ';
        const allowList = allowFilesList.split(SEPARATOR_CHARACTERS).filter(p => p);
        const ignoreList = ignoreFilesList.split(SEPARATOR_CHARACTERS).filter(p => p);

        const walker = walk.walk(fsys.absolutePath, {followLinks: false});

        walker.on('directories', (root: string, directories: FilesystemContent, next: any) => {
            const dirs = directories
                .filter(dir => isFileAllowed(fsys.absolutePath, allowList, ignoreList, root + '/' + dir.name))
                .map(dir => {
                    const path = getFilePath(root, fsys.absolutePath);
                    const level = getFileLevel(path);
                    const trt = false;

                    return {...dir, path, level, trt};
                });

            data = data.concat(dirs);

            next();
        });

        walker.on('file', async (root: string, file: IFileContent, next: any) => {
            file.hash = await utils.createHashFromFile(root + '/' + file.name);
            file.path = getFilePath(root, fsys.absolutePath);
            file.level = getFileLevel(file.path);
            file.trt = false;

            if (isFileAllowed(fsys.absolutePath, allowList, ignoreList, root + '/' + file.name)) {
                data.push(file);
            }

            next();
        });

        walker.on('end', () => {
            resolve(data);
        });
    });

export const database = async ({graphql}: IConfig): Promise<FullTreeContent> => {
    const httpLink: ApolloLink = createHttpLink({uri: graphql.uri, fetch: fetch as any});

    const authLink: ApolloLink = new ApolloLink((operation, forward) => {
        operation.setContext({
            headers: {
                authorization: graphql.token
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
        variables: {treeId: graphql.treeId}
    });

    return result.data.fullTreeContent;
};
