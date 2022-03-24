// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Colorspaces} from '../../types/constants';
import {IVersion} from '../../types/types';
import {getImageArgs} from './getImageArgs';

jest.mock('./helpers/getColorspace', () => ({
    getColorspace: jest.fn(() => Promise.resolve(Colorspaces.CMYK))
}));

jest.mock('./helpers/hasClippingPath', () => ({
    hasClippingPath: () => Promise.resolve(true)
}));

jest.mock('./helpers/hasTransparency', () => ({
    hasTransparency: () => Promise.resolve(true)
}));

describe('getImageArgs', () => {
    test('Compute preview command args', async () => {
        const ext = 'jpg';
        const input = 'test.jpg';
        const output = 'test.png';
        const size = 800;
        const name = 'medium';

        const version: IVersion = {
            sizes: [{output, size, name}]
        };

        const args = await getImageArgs(ext, input, output, size, name, version);

        // Args might be complicated and subject to change. Check snapshot to see if this looks fine
        expect(args).toMatchSnapshot();
    });
});
