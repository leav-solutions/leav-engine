// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {handleBackground} from './handleBackground';

describe('handleBackground', () => {
    const output = './test.png';
    const args = [output, '-alpha', output];
    test('background color', () => {
        const background = '#FF0000';

        const {command} = handleBackground(background, output);

        expect(command).toBe('magick');
    });

    test('background true', () => {
        const background = true;

        const {command} = handleBackground(background, output);

        expect(command).toBe('composite');
    });

    test('background false', () => {
        const background = false;

        const shouldBeNull = handleBackground(background, output);

        expect(shouldBeNull).toBeFalsy();
    });
});
