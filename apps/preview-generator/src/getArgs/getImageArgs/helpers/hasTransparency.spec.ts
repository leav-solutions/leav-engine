// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';
import {hasTransparency} from './hasTransparency';

vi.mock('child_process');

describe('hasTransparency', () => {
    test('Has transparency', async () => {
        vi.mocked(exec).mockImplementation((_cmd: any, cb: any) => cb(null, 'False', null));

        const res = await hasTransparency('test.psd');

        expect(res).toBe(true);
    });

    test("Hasn't transparency", async () => {
        vi.mocked(exec).mockImplementation((_cmd: any, cb: any) => cb(null, 'True', null));

        const res = await hasTransparency('test.psd');

        expect(res).toBe(false);
    });
});
