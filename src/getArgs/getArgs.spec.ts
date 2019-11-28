import {getArgs} from './getArgs';
import {getVideoArgs} from './getVideoArgs/getVideoArgs';
import {getImageArgs} from './getImageArgs/getImageArgs';

describe('getArgs', () => {
    test('type image use getImageArgs', () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'image';
        const input = 'test.jpg';
        const output = 'test.png';
        const ext = 'jpg';
        const size = 800;
        const useProfile = false;

        getArgs(type, input, output, size, useProfile);

        expect(getImageArgs).toBeCalledWith(ext, input, output, size, useProfile);
    });

    test('type video use getVideoArgs', () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'video';
        const input = 'test.mkv';
        const output = 'test.png';
        const size = 800;
        const useProfile = false;

        getArgs(type, input, output, size, useProfile);

        expect(getVideoArgs).toBeCalledWith(input, output, size);
    });

    test('type video use getVideoArgs', () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'other';
        const input = 'test.dsfsdfsdf';
        const output = 'test.png';
        const size = 800;
        const useProfile = false;

        expect(() => getArgs(type, input, output, size, useProfile)).toThrow();
    });
});
