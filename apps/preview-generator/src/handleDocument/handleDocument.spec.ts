// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {unlink} from 'fs';
import {getConfig} from '../getConfig/getConfig';
import {IVersion} from '../types/types';
import {getImageArgs} from './../getArgs/getImageArgs/getImageArgs';
import {handleDocument} from './handleDocument';

describe('getDocumentArgs', () => {
    const mockconf = {amqp: {hostname: 'localhost'}};

    (execFile as jest.FunctionLike) = jest.fn((...args) => args[3]());
    (unlink as jest.FunctionLike) = jest.fn((...args) => args[1]());

    (getImageArgs as jest.FunctionLike) = jest.fn(() => [
        {
            command: 'convert',
            args: [`${output}.pdf[0]`, 'png:' + output]
        }
    ]);
    (getConfig as jest.FunctionLike) = jest.fn(() => mockconf);

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
                name
            }
        ]
    };

    afterAll(() => jest.resetAllMocks());

    test('check unoconv command', async () => {
        await handleDocument({input, output, size, name, version, rootPaths, results: []});

        expect(execFile).toHaveBeenCalledWith(
            'unoconv',
            expect.arrayContaining([input, '/data/path/to/file.pdf']),
            expect.anything(),
            expect.anything()
        );
    });

    test('check convert command', async () => {
        await handleDocument({input, output, size, name, version, rootPaths, results: []});

        expect(execFile).toHaveBeenCalledWith(
            'convert',
            expect.arrayContaining([`${output}.pdf[0]`, 'png:' + output]),
            expect.anything(),
            expect.anything()
        );
    });
});
