// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';
import {checkClippingPathJpg} from './checkClippingPathJpg';

describe('checkClippingPathJpg', () => {
    test('exec identify', async () => {
        const input = './test.jpg';
        (exec as jest.FunctionLike) = jest.fn((cmd: string, callback: () => undefined) => callback());

        await checkClippingPathJpg(input);

        expect(exec).toBeCalledWith(expect.stringContaining('identify'), expect.anything());
    });
});
