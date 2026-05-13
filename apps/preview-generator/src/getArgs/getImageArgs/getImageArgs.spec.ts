import {Colorspaces} from '../../types/constants';
import {type IVersion} from '../../types/types';
import {getImageArgs} from './getImageArgs';

vi.mock('./helpers/getColorspace', () => ({
    getColorspace: vi.fn(() => Promise.resolve(Colorspaces.CMYK)),
}));

vi.mock('./helpers/hasClippingPath', () => ({
    hasClippingPath: () => Promise.resolve(true),
}));

vi.mock('./helpers/hasTransparency', () => ({
    hasTransparency: () => Promise.resolve(true),
}));

vi.mock('../../getConfig/getConfig', () => ({
    getConfig: async () => ({}),
}));

describe('getImageArgs', () => {
    test('Compute preview command args', async () => {
        const ext = 'jpg';
        const input = 'test.jpg';
        const output = 'test.png';
        const size = 800;
        const name = 'medium';

        const version: IVersion = {
            sizes: [{output, size, name}],
        };

        const args = await getImageArgs(ext, input, output, size, name, version);

        // Args might be complicated and subject to change. Check snapshot to see if this looks fine
        expect(args).toMatchSnapshot();
    });
});
