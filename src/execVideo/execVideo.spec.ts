import * as child_process from 'child_process';
import {execVideo} from './execVideo';

const size = {width: 800, height: 600};
const input = 'test.avi';
const output = 'test.png';

describe('test execPsd', () => {
    test('arguments', () => {
        (child_process.execFileSync as jest.FunctionLike) = jest.fn();

        execVideo(input, output, size);

        expect(child_process.execFileSync).toBeCalledWith(
            'ffmpeg',
            expect.arrayContaining(['thumbnail,scale=' + size.width + ':' + size.height, `png:${output}`])
        );
    });
});
