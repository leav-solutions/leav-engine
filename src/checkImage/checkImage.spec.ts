import {checkClipJpg} from './checkImage';
import * as child_process from 'child_process';
import {execImageWithClip, execImage} from '../execImage/execImage';

describe('test checkClipJpg', () => {
    const size = {width: 800, height: 800};
    const input = 'test.jpg';
    const output = 'test.png';
    const imgArgs = [
        '-resize',
        `${size.width}x${size.height}>`,
        '-density',
        '200',
        '-profile',
        '/app/profile/EuroscaleCoated.icc',
        '-profile',
        '/app/profile/srgb.icm',
        input,
        `png:${output}`
    ];

    test('without clip', () => {
        (child_process.execSync as jest.FunctionLike) = jest.fn(() => {
            throw new Error('no clip path');
        });
        (execImage as jest.FunctionLike) = jest.fn();
        (execImageWithClip as jest.FunctionLike) = jest.fn();

        checkClipJpg(input, output, imgArgs);

        expect(execImage).toBeCalled();
    });

    test('without clip', () => {
        (child_process.execSync as jest.FunctionLike) = jest.fn();
        (execImage as jest.FunctionLike) = jest.fn();
        (execImageWithClip as jest.FunctionLike) = jest.fn();

        checkClipJpg(input, output, imgArgs);

        expect(execImageWithClip).toBeCalled();
    });
});
