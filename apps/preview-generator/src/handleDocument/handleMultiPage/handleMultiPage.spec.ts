// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {exists, mkdir} from 'fs';
import {handleMultiPage} from './handleMultiPage';

vi.mock('child_process', () => ({
    execFile: vi.fn((_cmd: any, _args: any, cb: any) => cb(null, '10')),
}));
vi.mock('fs', () => ({
    access: vi.fn((_path: any, cb: any) => cb()),
    mkdir: vi.fn((_path: any, cb: any) => cb()),
    exists: vi.fn((_path: any, cb: any) => cb()),
}));

describe('handleMultiPage', () => {
    test('gs use call with the right arguments', async () => {
        const pdfFile = './test';
        const multiPage = '';
        const rootPaths = {input: '/data/', output: '/data/'};

        await handleMultiPage(pdfFile, multiPage, rootPaths, []);

        expect(execFile).toBeCalledWith('gs', expect.arrayContaining(['-c']), expect.anything());
        expect(execFile).lastCalledWith('gs', expect.arrayContaining(['-sDEVICE=pdfwrite']), expect.anything());
    });
});
