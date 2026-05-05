// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {type IVersion} from '../types/types';
import {handleDocument} from './handleDocument';

vi.mock('child_process', () => ({
    execFile: vi.fn((_cmd: any, _args: any, _opts: any, cb: any) => cb()),
}));
vi.mock('fs', () => ({
    unlink: vi.fn((_path: any, cb: any) => cb()),
}));
vi.mock('../getArgs/getImageArgs/getImageArgs', () => ({
    getImageArgs: vi.fn(() => [
        {
            command: 'convert',
            args: ['test.png.pdf[0]', 'png:test.png'],
        },
    ]),
}));
vi.mock('../getConfig/getConfig', () => ({
    getConfig: vi.fn(() => ({amqp: {hostname: 'localhost'}})),
}));

describe('getDocumentArgs', () => {
    const input = 'test.docx';
    const output = 'test.png';
    const size = 800;
    const name = 'big';
    const rootPaths = {input: '/data/', output: '/data/'};
    const version: IVersion = {
        pdf: '/path/to/file.pdf',
        sizes: [
            {
                size,
                output,
                name,
            },
        ],
    };

    afterAll(() => vi.resetAllMocks());

    test('check unoconv command', async () => {
        await handleDocument({input, output, size, name, version, rootPaths, results: []});

        expect(execFile).toHaveBeenCalledWith(
            'unoconv',
            expect.arrayContaining([input, '/data/path/to/file.pdf']),
            expect.anything(),
            expect.anything(),
        );
    });

    test('check convert command', async () => {
        await handleDocument({input, output, size, name, version, rootPaths, results: []});

        expect(execFile).toHaveBeenCalledWith(
            'convert',
            expect.arrayContaining([`${output}.pdf[0]`, 'png:' + output]),
            expect.anything(),
            expect.anything(),
        );
    });
});
