// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {checkClippingPathPsd} from './checkClippingPathPsd';

describe('checkClippingPathPsd', () => {
    test('use identify on input', async () => {
        const input = 'test.jpg';
        (execFile as jest.FunctionLike) = jest.fn((...args) => args[3](undefined, true));

        await checkClippingPathPsd(input);

        expect(execFile).toBeCalledWith(
            'identify',
            expect.arrayContaining([input]),
            expect.anything(),
            expect.anything()
        );
    });
});
