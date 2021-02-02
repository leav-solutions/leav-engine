// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {handleBackground} from './handleBackground';

describe('handleBackground', () => {
    const output = './test.png';
    const args = [output, '-alpha', output];
    test('background color', () => {
        const background = '#FF0000';

        const {command} = handleBackground(args, background, output);

        expect(command).toBe('convert');
    });

    test('background true', () => {
        const background = true;

        const {command} = handleBackground(args, background, output);

        expect(command).toBe('composite');
    });

    test('background false', () => {
        const background = false;

        const shouldBeNull = handleBackground(args, background, output);

        expect(shouldBeNull).toBeFalsy();
    });
});
