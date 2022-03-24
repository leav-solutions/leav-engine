// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';
import {Colorspaces} from '../../../types/constants';
import {getColorspace} from './getColorspace';

describe('getColorspace', () => {
    test('Detect CMYK colorspace', async () => {
        (exec as jest.FunctionLike) = jest
            .fn()
            .mockImplementation((cmd, cb) => cb(null, 'blah blabh CMYK blah blah', null));

        const colorspace = await getColorspace('test.jpg');

        expect(colorspace).toEqual(Colorspaces.CMYK);
    });

    test('Detect RGB colorspace', async () => {
        (exec as jest.FunctionLike) = jest
            .fn()
            .mockImplementation((cmd, cb) => cb(null, 'blah blabh sRGB blah blah', null));

        const colorspace = await getColorspace('test.jpg');

        expect(colorspace).toEqual(Colorspaces.RGB);
    });
});
