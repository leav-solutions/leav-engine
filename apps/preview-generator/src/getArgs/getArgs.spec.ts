// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorPreview} from '../errors/ErrorPreview';
import {IVersion} from '../types/types';
import {getArgs} from './getArgs';
import {getImageArgs} from './getImageArgs/getImageArgs';
import {getVideoArgs} from './getVideoArgs/getVideoArgs';

describe('getArgs', () => {
    test('type image use getImageArgs', async () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'image';
        const input = 'test.jpg';
        const output = 'test.png';
        const ext = 'jpg';
        const size = 800;
        const name = 'test_big';
        const useProfile = false;

        const version: IVersion = {
            sizes: [
                {
                    size,
                    output,
                    name
                }
            ]
        };

        await getArgs(type, input, output, size, name, version, useProfile);

        expect(getImageArgs).toBeCalledWith(ext, input, output, size, name, version, useProfile);
    });

    test('type video use getVideoArgs', async () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'video';
        const input = 'test.mkv';
        const output = 'test.png';
        const size = 800;
        const name = 'test_big';
        const useProfile = false;

        const version: IVersion = {
            sizes: [
                {
                    size,
                    output,
                    name
                }
            ]
        };

        await getArgs(type, input, output, size, name, version, useProfile);

        expect(getVideoArgs).toBeCalledWith(input, output, size);
    });

    test('none exist type should throw', async () => {
        (getImageArgs as jest.FunctionLike) = jest.fn();
        (getVideoArgs as jest.FunctionLike) = jest.fn();

        const type = 'other';
        const input = 'test.dsfsdfsdf';
        const output = 'test.png';
        const size = 800;
        const name = 'test_big';
        const useProfile = false;

        const version: IVersion = {
            sizes: [
                {
                    size,
                    output,
                    name
                }
            ]
        };

        await expect(getArgs(type, input, output, size, name, version, useProfile)).rejects.toStrictEqual(
            new ErrorPreview({
                error: 304,
                params: {
                    output,
                    size,
                    name
                }
            })
        );
    });
});
