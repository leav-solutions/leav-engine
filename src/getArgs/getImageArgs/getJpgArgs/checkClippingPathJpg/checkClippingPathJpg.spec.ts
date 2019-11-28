import {execSync} from 'child_process';
import {checkClippingPathJpg} from './checkClippingPathJpg';

describe('checkClippingPathJpg', () => {
    test('exec identify', () => {
        const input = './test.jpg';
        (execSync as jest.FunctionLike) = jest.fn();

        checkClippingPathJpg(input);

        expect(execSync).toBeCalledWith(expect.stringContaining('identify'), expect.anything());
    });
});
