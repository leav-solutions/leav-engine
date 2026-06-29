import {execFile} from 'child_process';
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
