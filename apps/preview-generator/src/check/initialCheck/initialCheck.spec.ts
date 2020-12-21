import * as fs from 'fs';
import {ErrorPreview} from './../../types/ErrorPreview';
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
