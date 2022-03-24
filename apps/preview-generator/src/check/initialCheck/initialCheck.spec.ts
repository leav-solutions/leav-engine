// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as fs from 'fs';
import {ErrorPreview} from '../../errors/ErrorPreview';
import {IConfig} from './../../types/types';
import {initialCheck} from './initialCheck';

describe('initialCheck', () => {
    afterAll(() => jest.resetAllMocks());

    const config: Mockify<IConfig> = {
        inputRootPath: '/data',
        outputRootPath: '/data'
    };

    test('check inputRootPath should throw', async () => {
        (console.error as jest.FunctionLike) = jest.fn();
        (fs.promises.access as jest.FunctionLike) = jest.fn().mockRejectedValue(null);

        await expect(initialCheck(config as IConfig)).rejects.toStrictEqual(
            new ErrorPreview({
                error: 101
            })
        );
    });

    test('check intputRootPath should be called two timeswith', async () => {
        (fs.promises.access as jest.FunctionLike) = global.__mockPromise((...args) => args[1]());

        await initialCheck(config as IConfig);

        expect(fs.promises.access).nthCalledWith(1, config.inputRootPath);
    });

    test('check outputRootPath should be call with ', async () => {
        (fs.promises.access as jest.FunctionLike) = global.__mockPromise((...args) => args[1]());

        await initialCheck(config as IConfig);

        expect(fs.promises.access).lastCalledWith(config.outputRootPath);
    });
});
