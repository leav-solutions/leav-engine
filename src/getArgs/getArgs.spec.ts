import {IVersion} from './../types';
import {getArgs} from './getArgs';
import {getVideoArgs} from './getVideoArgs/getVideoArgs';
import {getImageArgs} from './getImageArgs/getImageArgs';

describe('getArgs', () => {
    test('type image use getImageArgs', async () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'image';
        const input = 'test.jpg';
        const output = 'test.png';
        const ext = 'jpg';
        const size = 800;
        const useProfile = false;

        const version: IVersion = {
            sizes: [
                {
                    size,
                    output,
                },
            ],
        };

        await getArgs(type, input, output, size, version, useProfile);

        expect(getImageArgs).toBeCalledWith(ext, input, output, size, version, useProfile);
    });

    test('type video use getVideoArgs', async () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'video';
        const input = 'test.mkv';
        const output = 'test.png';
        const size = 800;
        const useProfile = false;

        const version: IVersion = {
            sizes: [
                {
                    size,
                    output,
                },
            ],
        };

        await getArgs(type, input, output, size, version, useProfile);

        expect(getVideoArgs).toBeCalledWith(input, output, size);
    });

    test('none exist type should throw', async () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'other';
        const input = 'test.dsfsdfsdf';
        const output = 'test.png';
        const size = 800;
        const useProfile = false;

        const version: IVersion = {
            sizes: [
                {
                    size,
                    output,
                },
            ],
        };

        await expect(getArgs(type, input, output, size, version, useProfile)).rejects.toStrictEqual({
            error: 5,
            params: {
                output,
                size,
            },
        });
    });
});
