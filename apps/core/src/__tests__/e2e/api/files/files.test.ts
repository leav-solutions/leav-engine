// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';
import {join} from 'path';
import * as fs from 'fs';
import {getConfig} from '../../../../config';

const fileExists = async (path: string) => !!(await fs.promises.stat(path).catch(e => false));

const directoriesLibrary = 'files_directories';
const filesTree = 'files_tree';

describe('Files', () => {
    test('create directory', async () => {
        const conf = await getConfig();

        const rootPath = conf.files.rootPaths.trim().split(':')[1];
        const dirName = 'dirName';

        const workDir = join(rootPath, dirName);

        const res = await makeGraphQlCall(
            `mutation { createDirectory(library: "${directoriesLibrary}", nodeId: "${filesTree}", name: "${dirName}") { id }}`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.createDirectory.id).toBeDefined();

        expect(await fileExists(workDir)).toBeTruthy();

        if (await fileExists(workDir)) {
            await fs.promises.rmdir(workDir);
        }
    });
});
