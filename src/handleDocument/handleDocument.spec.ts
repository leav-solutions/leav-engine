import {unlinkSync} from 'fs';
import {getConfig} from '../getConfig/getConfig';
import {execFileSync} from 'child_process';
import {handleDocument} from './handleDocument';

import config = require('../../config/config_spec.json');

describe('getDocumentArgs', () => {
    afterAll(() => jest.resetAllMocks());

    (execFileSync as jest.FunctionLike) = jest.fn();
    (getConfig as jest.FunctionLike) = jest.fn(() => config);
    (unlinkSync as jest.FunctionLike) = jest.fn();

    const input = 'test.docx';
    const output = 'test.png';
    const size = 800;

    handleDocument(input, output, size);

    test('check unoconv commad', () => {
        expect(execFileSync).toHaveBeenCalledWith(
            'unoconv',
            expect.arrayContaining([input, `${output}.pdf`]),
            expect.anything(),
        );
    });

    test('check convert command', () => {
        expect(execFileSync).toHaveBeenLastCalledWith(
            'convert',
            expect.arrayContaining([`${output}.pdf[0]`, 'png:' + output]),
            expect.anything(),
        );
    });
});
