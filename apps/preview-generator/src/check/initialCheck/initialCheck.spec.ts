// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as fs from 'fs';
import {type IConfig} from './../../types/types';
import {initialCheck} from './initialCheck';

describe('initialCheck', () => {
    afterAll(() => vi.resetAllMocks());

    const config: Mockify<IConfig> = {
        inputRootPath: '/data',
        outputRootPath: '/data',
    };

    test('check inputRootPath should throw', async () => {
        (fs.promises.access as any) = vi.fn().mockRejectedValue(null);

        await expect(initialCheck(config as IConfig)).rejects.toMatchObject({
            error: 101,
        });
    });

    test('check intputRootPath should be called two timeswith', async () => {
        (fs.promises.access as any) = global.__mockPromise((...args) => args[1]());

        await initialCheck(config as IConfig);

        expect(fs.promises.access).nthCalledWith(1, config.inputRootPath);
    });

    test('check outputRootPath should be call with ', async () => {
        (fs.promises.access as any) = global.__mockPromise((...args) => args[1]());

        await initialCheck(config as IConfig);

        expect(fs.promises.access).lastCalledWith(config.outputRootPath);
    });
});
