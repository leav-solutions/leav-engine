import {handleMultiPage} from './handleMultiPage';
import {existsSync, mkdirSync} from 'fs';
import {execFileSync} from 'child_process';

describe('handleMultiPage', () => {
    test('test', () => {
        const pdfFile = './test';
        const multiPage = '';
        const rootPath = '/data/';

        (mkdirSync as jest.FunctionLike) = jest.fn();
        (existsSync as jest.FunctionLike) = jest.fn();
        (execFileSync as jest.FunctionLike) = jest.fn(() => '10');

        handleMultiPage(pdfFile, multiPage, rootPath);

        expect(execFileSync).toBeCalledWith('gs', expect.anything());
        expect(execFileSync).lastCalledWith('gs', expect.arrayContaining([pdfFile]), expect.anything());
    });
});
