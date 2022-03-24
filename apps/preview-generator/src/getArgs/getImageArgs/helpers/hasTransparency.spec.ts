// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';
import {hasTransparency} from './hasTransparency';

describe('hasTransparency', () => {
    test('Has transparency', async () => {
        (exec as jest.FunctionLike) = jest.fn().mockImplementation((cmd, cb) => cb(null, 'False', null));

        const res = await hasTransparency('test.psd');

        expect(res).toBe(true);
    });

    test("Hasn't transparency", async () => {
        (exec as jest.FunctionLike) = jest.fn().mockImplementation((cmd, cb) => cb(null, 'True', null));

        const res = await hasTransparency('test.psd');

        expect(res).toBe(false);
    });
});
