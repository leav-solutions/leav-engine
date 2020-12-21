import {checkInput} from './checkInput';
import {access, lstat} from 'fs';

jest.mock('fs');

describe('checkInput', () => {
    afterAll(() => jest.resetAllMocks());

    const inputRootPath = '/data/';
    const path = 'test.jpg';
    const absPath = inputRootPath + path;
    const isFile = jest.fn(() => true);

    (access as jest.FunctionLike) = jest.fn((...args) => args[1]());
    (lstat as jest.FunctionLike) = jest.fn((...args) =>
        args[1](null, {
            isFile
        })
    );

    test('should check file exist', async () => {
        await checkInput(path, inputRootPath);
        expect(access).toBeCalledWith(absPath, expect.anything());
    });

    test('should test file stats', async () => {
        await checkInput(path, inputRootPath);
        expect(lstat).toBeCalledWith(absPath, expect.anything());
        expect(isFile).toBeCalled();
    });
});
