// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';
import {hasClippingPath} from './hasClippingPath';

vi.mock('child_process');

describe('getColorspace', () => {
    test('Has clipping path', async () => {
        vi.mocked(exec).mockImplementation((_cmd: any, cb: any) =>
            cb(null, 'any string representing clipping path', null),
        );

        const res = await hasClippingPath('test.jpg');

        expect(res).toBe(true);
    });

    test("Hasn't clipping path", async () => {
        vi.mocked(exec).mockImplementation((_cmd: any, cb: any) => cb('ERR', null, null));

        const res = await hasClippingPath('test.jpg');

        expect(res).toBe(false);
    });
});
