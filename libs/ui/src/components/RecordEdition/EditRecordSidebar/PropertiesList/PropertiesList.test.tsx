import {render, screen} from '_ui/_tests/testUtils';
import PropertiesList from './PropertiesList';

describe('PropertiesList', () => {
    const items = [
        {
            title: 'fieldA',
            value: 'valueA',
        },
        {
            title: 'fieldB',
            value: 'valueB',
        },
    ];

    it('should render items', () => {
        render(<PropertiesList items={items} />);

        items.forEach(item => {
            expect(screen.getByText(item.title)).toBeInTheDocument();
            expect(screen.getByText(item.value)).toBeInTheDocument();
        });
    });
});
