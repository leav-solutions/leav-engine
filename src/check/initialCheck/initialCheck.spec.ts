import {access} from 'fs';
import {ErrorPreview} from './../../types/ErrorPreview';
import {IConfig} from './../../types/types';
import {initialCheck} from './initialCheck';

describe('initialCheck', () => {
    afterAll(() => jest.resetAllMocks());

    const config: Mockify<IConfig> = {
        inputRootPath: '/data',
        outputRootPath: '/data',
    };

    test('check inputRootPath should throw', async () => {
        await expect(initialCheck(config as IConfig)).rejects.toStrictEqual(
            new ErrorPreview({
                error: 101,
            }),
        );
    });

    test('check outputRootPath should be call with ', async () => {
        (access as jest.FunctionLike) = jest.fn((...args) => args[1]());

        await initialCheck(config as IConfig);

        expect(access).nthCalledWith(1, config.outputRootPath, expect.anything());
    });

    test('check outputRootPath should be call with ', async () => {
        (access as jest.FunctionLike) = jest.fn((...args) => args[1]());

        await initialCheck(config as IConfig);

        expect(access).lastCalledWith(config.outputRootPath, expect.anything());
    });
});
