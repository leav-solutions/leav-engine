import {getJpgArgs} from './getJpgArgs';
import {checkClippingPathJpg} from './checkClippingPathJpg/checkClippingPathJpg';

describe('checkClippingPathJpg', () => {
    test('args clip', async () => {
        const input = './test.jpg';
        (checkClippingPathJpg as jest.FunctionLike) = jest.fn(() => true);

        const args = await getJpgArgs(input);

        expect(args.after).toContain('-clip');
    });

    test('args without clip', async () => {
        const input = './test.jpg';
        (checkClippingPathJpg as jest.FunctionLike) = jest.fn(() => false);

        const args = await getJpgArgs(input);

        expect(args).toEqual({
            before: [],
            after: [],
        });
    });
});
