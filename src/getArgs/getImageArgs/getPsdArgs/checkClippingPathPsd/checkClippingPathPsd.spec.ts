import {execFileSync} from 'child_process';
import {checkClippingPathPsd} from './checkClippingPathPsd';

describe('checkClippingPathPsd', () => {
    test('use identify on input', () => {
        const input = 'test.jpg';
        (execFileSync as jest.FunctionLike) = jest.fn(() => true);

        checkClippingPathPsd(input);

        expect(execFileSync).toBeCalledWith('identify', expect.arrayContaining([input]), expect.anything());
    });
});
