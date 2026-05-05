// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {checkInput} from './checkInput';
import {access, lstat} from 'fs';

vi.mock('fs');

describe('checkInput', () => {
    afterAll(() => vi.resetAllMocks());

    const inputRootPath = '/data/';
    const path = 'test.jpg';
    const absPath = inputRootPath + path;
    const isFile = vi.fn(() => true);

    vi.mocked(access).mockImplementation((...args: any[]) => args[1]());
    vi.mocked(lstat).mockImplementation((...args: any[]) => args[1](null, {isFile}));

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
