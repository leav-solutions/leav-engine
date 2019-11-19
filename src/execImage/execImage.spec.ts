import * as child_process from 'child_process';
import {execImage, execImageWithClip} from './execImage';

const size = {width: 800, height: 600};
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

describe('test execImage', () => {
    test('arguments', () => {
        (child_process.execFileSync as jest.FunctionLike) = jest.fn();

        execImage(output, imgArgs);

        expect(child_process.execFileSync).toBeCalledWith(
            'convert',
            expect.arrayContaining(['-resize', `${size.width}x${size.height}>`, input, `png:${output}`])
        );
    });
});

describe('test execImageWithClip', () => {
    test('arguments', () => {
        (child_process.execFileSync as jest.FunctionLike) = jest.fn();

        execImageWithClip(output, imgArgs);

        expect(child_process.execFileSync).toBeCalledWith(
            'convert',
            expect.arrayContaining(['-resize', `${size.width}x${size.height}>`, input, '-clip', `png:${output}`])
        );
    });
});
