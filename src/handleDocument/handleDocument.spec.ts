import {getImageArgs} from './../getArgs/getImageArgs/getImageArgs';
import {IVersion} from '../types/types';
import {unlink} from 'fs';
import {getConfig} from '../getConfig/getConfig';
import {execFile} from 'child_process';
import {handleDocument} from './handleDocument';

import config = require('../../config/config_spec.json');

describe('getDocumentArgs', () => {
    afterAll(() => jest.resetAllMocks());

    (execFile as jest.FunctionLike) = jest.fn((...args) => args[3]());
    (unlink as jest.FunctionLike) = jest.fn((...args) => args[1]());

    (getImageArgs as jest.FunctionLike) = jest.fn(() => [
        {
            command: 'convert',
            args: [`${output}.pdf[0]`, 'png:' + output],
        },
    ]);
    (getConfig as jest.FunctionLike) = jest.fn(() => config);

    const input = 'test.docx';
    const output = 'test.png';
    const size = 800;
    const name = 'big';
    const rootPaths = {input: '/data/', output: '/data/'};
    const version: IVersion = {
        sizes: [
            {
                size,
                output,
                name,
            },
        ],
    };

    (async () => handleDocument(input, output, size, name, version, rootPaths))();

    test('check unoconv command', () => {
        expect(execFile).toHaveBeenCalledWith(
            'unoconv',
            expect.arrayContaining([input, `${output}.pdf`]),
            expect.anything(),
            expect.anything(),
        );
    });

    test('check convert command', () => {
        expect(execFile).toHaveBeenCalledWith(
            'convert',
            expect.arrayContaining([`${output}.pdf[0]`, 'png:' + output]),
            expect.anything(),
            expect.anything(),
        );
    });
});
