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
});
