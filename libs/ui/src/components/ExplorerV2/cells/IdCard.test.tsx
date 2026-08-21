import {render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {IdCard} from './IdCard';

describe('IdCard component', () => {
    test('Should paint the color bar with the identity card color', async () => {
        const {container} = render(<IdCard item={{...mockRecord, color: '#ff0000'}} />);

        expect(container.querySelector('.card-color')).toHaveStyle({backgroundColor: '#ff0000'});
    });

    test('Should keep a transparent color bar when the identity card has no color', async () => {
        const {container} = render(<IdCard item={{...mockRecord, color: null}} />);

        expect(container.querySelector('.card-color')).toHaveStyle({backgroundColor: 'transparent'});
    });

    test('Should default to reserving the color bar space when hasColorConfigured is not provided', async () => {
        const {container} = render(<IdCard item={{...mockRecord, color: null}} />);

        expect(container.querySelector('.card-color')).toHaveStyle({backgroundColor: 'transparent'});
    });

    test('Should omit the color bar entirely when the library has no color attribute configured', async () => {
        const {container} = render(<IdCard item={{...mockRecord, color: null}} hasColorConfigured={false} />);

        expect(container.querySelector('.card-color')).not.toBeInTheDocument();
    });

    test('Should still paint the color bar when hasColorConfigured is false but the record has a color', async () => {
        // hasColorConfigured only gates the transparent FALLBACK: an actual color value always wins.
        const {container} = render(<IdCard item={{...mockRecord, color: '#ff0000'}} hasColorConfigured={false} />);

        expect(container.querySelector('.card-color')).toHaveStyle({backgroundColor: '#ff0000'});
    });
});
