import {handleMultiPage} from './handleMultiPage';
import {exists, mkdir} from 'fs';
import {execFile} from 'child_process';

describe('handleMultiPage', () => {
    test('test', async () => {
        const pdfFile = './test';
        const multiPage = '';
        const rootPaths = {input: '/data/', output: '/data/'};

        (mkdir as jest.FunctionLike) = jest.fn((...args) => args[2]());
        (exists as jest.FunctionLike) = jest.fn((...args) => args[1]());
        (execFile as jest.FunctionLike) = jest.fn((...args) => args[2](null, '10'));

        await handleMultiPage(pdfFile, multiPage, rootPaths);

        expect(execFile).toBeCalledWith('gs', expect.anything(), expect.anything());
        expect(execFile).lastCalledWith('gs', expect.anything(), expect.anything());
    });
});
