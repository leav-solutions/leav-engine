// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isFileAllowed} from '@leav/utils';
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
import {IDbScanResult} from './_types/queries';

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

export const database = async ({graphql}: IConfig): Promise<IDbScanResult> => {
    const url = `${graphql.uri}?key=${graphql.apiKey}`;
    const httpLink: ApolloLink = createHttpLink({uri: url, fetch: fetch as any});

    const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache()
    });

    // Get tree libraries settings to identify which library is directories and which is files
    const treePropsQuery: DocumentNode = gql`
        query GET_TREES($treeId: ID!) {
            trees(filters: {id: $treeId}) {
                list {
                    libraries {
                        library {
                            id
                            behavior
                        }
                    }
                }
            }
        }
    `;
    const treePropsResult: ApolloQueryResult<any> = await client.query({
        query: treePropsQuery,
        variables: {treeId: graphql.treeId}
    });
    const treeData = treePropsResult.data.trees.list[0];
    if (!treeData) {
        throw new Error(`Unknown tree ${graphql.treeId}`);
    }

    const filesLibraryId = treeData.libraries.find(l => l.library.behavior === 'files').library.id;
    const directoriesLibraryId = treeData.libraries.find(l => l.library.behavior === 'directories').library.id;

    // Get full tree content
    const getFullTreeContent: DocumentNode = gql`
        query GET_FULL_TREE_CONTENT($treeId: ID!) {
            fullTreeContent(treeId: $treeId)
        }
    `;

    const result: ApolloQueryResult<any> = await client.query({
        query: getFullTreeContent,
        variables: {treeId: graphql.treeId}
    });

    return {
        filesLibraryId,
        directoriesLibraryId,
        treeContent: result.data.fullTreeContent
    };
};
