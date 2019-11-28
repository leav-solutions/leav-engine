import {getVideoArgs} from './getVideoArgs';

describe('getVideoArgs', () => {
    test('args return', () => {
        const input = 'test.jpg';
        const output = 'test.png';
        const size = 800;
        const commandAndArgs = getVideoArgs(input, output, size);

        expect(commandAndArgs).toMatchObject({command: 'ffmpeg', args: expect.arrayContaining([input])});
    });
});
