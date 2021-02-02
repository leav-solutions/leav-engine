// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {checkClippingPathPsd} from './checkClippingPathPsd/checkClippingPathPsd';
import {getPsdArgs} from './getPsdArgs';

describe('getPsdArgs', () => {
    test('args clipping path psd', async () => {
        const input = 'test.jpg';
        (checkClippingPathPsd as jest.FunctionLike) = jest.fn(() => true);

        const args = await getPsdArgs(input);

        expect(args.before.length).toBe(0);
        expect(args.after).toContain('-clip');
    });

    test('args no clipping path psd', async () => {
        const input = 'test.jpg';
        (checkClippingPathPsd as jest.FunctionLike) = jest.fn(() => false);

        const args = await getPsdArgs(input);

        expect(args.before).toContain('-flatten');
        expect(args.after.length).toBe(0);
    });
});
