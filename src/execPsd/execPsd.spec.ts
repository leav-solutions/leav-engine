import * as child_process from 'child_process';
import {execPsdWithClip} from './execPsd';

const size = {width: 800, height: 600};
const input = 'test.psd';
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

describe('test execPsd', () => {
    test('arguments', () => {
        (child_process.execFileSync as jest.FunctionLike) = jest.fn();

        execPsdWithClip(output, imgArgs);

        expect(child_process.execFileSync).toBeCalledWith(
            'convert',
            expect.arrayContaining(['-resize', `${size.width}x${size.height}>`, '-flatten', input, `png:${output}`])
        );
    });
});
