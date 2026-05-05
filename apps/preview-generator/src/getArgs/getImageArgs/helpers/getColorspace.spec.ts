// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';
import {Colorspaces} from '../../../types/constants';
import {getColorspace} from './getColorspace';

vi.mock('child_process');

describe('getColorspace', () => {
    test('Detect CMYK colorspace', async () => {
        vi.mocked(exec).mockImplementation((_cmd: any, cb: any) => cb(null, 'blah blabh CMYK blah blah', null));

        const colorspace = await getColorspace('test.jpg');

        expect(colorspace).toEqual(Colorspaces.CMYK);
    });

    test('Detect RGB colorspace', async () => {
        vi.mocked(exec).mockImplementation((_cmd: any, cb: any) => cb(null, 'blah blabh sRGB blah blah', null));

        const colorspace = await getColorspace('test.jpg');

        expect(colorspace).toEqual(Colorspaces.RGB);
    });
});
