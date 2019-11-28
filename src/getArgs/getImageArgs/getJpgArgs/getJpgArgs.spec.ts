import {getJpgArgs} from './getJpgArgs';
import {checkClippingPathJpg} from './checkClippingPathJpg/checkClippingPathJpg';

describe('checkClippingPathJpg', () => {
    test('args clip', () => {
        const input = './test.jpg';
        (checkClippingPathJpg as jest.FunctionLike) = jest.fn(() => true);

        const args = getJpgArgs(input);

        expect(args.after).toContain('-clip');
    });

    test('args without clip', () => {
        const input = './test.jpg';
        (checkClippingPathJpg as jest.FunctionLike) = jest.fn(() => false);

        const args = getJpgArgs(input);

        expect(args).toEqual({
            before: [],
            after: [],
        });
    });
});
