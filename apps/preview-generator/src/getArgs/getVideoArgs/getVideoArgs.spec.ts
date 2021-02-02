// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getVideoArgs} from './getVideoArgs';

describe('getVideoArgs', () => {
    test('args return', () => {
        const input = 'test.jpg';
        const output = 'test.png';
        const size = 800;
        const [commandAndArgs] = getVideoArgs(input, output, size);

        expect(commandAndArgs).toMatchObject({command: 'ffmpeg', args: expect.arrayContaining([input])});
    });
});
