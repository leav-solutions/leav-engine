import {execFile} from 'child_process';
import {exists, mkdir} from 'fs';
import {handleMultiPage} from './handleMultiPage';

describe('handleMultiPage', () => {
    test('gs use call with the right arguments', async () => {
        const pdfFile = './test';
        const multiPage = '';
        const rootPaths = {input: '/data/', output: '/data/'};

        (mkdir as jest.FunctionLike) = jest.fn((...args) => args[1]());
        (exists as jest.FunctionLike) = jest.fn((...args) => args[1]());
        (execFile as jest.FunctionLike) = jest.fn((...args) => args[2](null, '10'));

        await handleMultiPage(pdfFile, multiPage, rootPaths, []);

        expect(execFile).toBeCalledWith('gs', expect.arrayContaining(['-c']), expect.anything());
        expect(execFile).lastCalledWith('gs', expect.arrayContaining(['-sDEVICE=pdfwrite']), expect.anything());
    });
});
