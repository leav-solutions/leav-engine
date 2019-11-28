import {checkInput} from './checkInput';
import {existsSync, lstatSync} from 'fs';

jest.mock('fs');

describe('checkInput', () => {
    afterAll(() => jest.resetAllMocks());

    const path = '/app/test.jpg';
    const isFile = jest.fn(() => true);

    (existsSync as jest.FunctionLike) = jest.fn(() => true);
    (lstatSync as jest.FunctionLike) = jest.fn(() => ({
        isFile,
    }));

    test('should check file exist', () => {
        checkInput(path);
        expect(existsSync).toBeCalledWith(path);
    });

    test('should test file stats', () => {
        checkInput(path);
        expect(lstatSync).toBeCalledWith(path);
        expect(isFile).toBeCalled();
    });
});
