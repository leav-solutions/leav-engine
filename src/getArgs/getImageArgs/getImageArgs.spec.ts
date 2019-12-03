import {getConfig} from './../../getConfig/getConfig';
import {getJpgArgs} from './getJpgArgs/getJpgArgs';
import {getImageArgs} from './getImageArgs';

describe('getImageArgs', () => {
    test('call getJpgArgs for jpg extension', () => {
        const ext = 'jpg';
        const input = 'test.jpg';
        const output = 'test.png';
        const size = 800;

        (getJpgArgs as jest.FunctionLike) = jest.fn(() => ({before: [], after: []}));

        getImageArgs(ext, input, output, size);

        expect(getJpgArgs).toBeCalled();
    });

    test('call getJpgArgs for jpeg extension', () => {
        const ext = 'jpeg';
        const input = 'test.jpeg';
        const output = 'test.png';
        const size = 800;

        (getJpgArgs as jest.FunctionLike) = jest.fn(() => ({before: [], after: []}));

        getImageArgs(ext, input, output, size);

        expect(getJpgArgs).toBeCalled();
    });
});
