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
