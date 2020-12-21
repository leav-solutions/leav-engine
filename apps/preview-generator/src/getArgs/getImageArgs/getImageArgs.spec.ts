import {IVersion} from '../../types/types';
import {getJpgArgs} from './getJpgArgs/getJpgArgs';
import {getImageArgs} from './getImageArgs';

describe('getImageArgs', () => {
    test('call getJpgArgs for jpg extension', () => {
        const ext = 'jpg';
        const input = 'test.jpg';
        const output = 'test.png';
        const size = 800;
        const name = 'medium';

        const version: IVersion = {
            sizes: [{output, size, name}],
        };

        (getJpgArgs as jest.FunctionLike) = jest.fn(() => ({before: [], after: []}));

        getImageArgs(ext, input, output, size, name, version);

        expect(getJpgArgs).toBeCalled();
    });

    test('call getJpgArgs for jpeg extension', () => {
        const ext = 'jpeg';
        const input = 'test.jpeg';
        const output = 'test.png';
        const size = 800;

        const version: IVersion = {
            sizes: [{output, size, name}],
        };

        (getJpgArgs as jest.FunctionLike) = jest.fn(() => ({before: [], after: []}));

        getImageArgs(ext, input, output, size, name, version);

        expect(getJpgArgs).toBeCalled();
    });
});
