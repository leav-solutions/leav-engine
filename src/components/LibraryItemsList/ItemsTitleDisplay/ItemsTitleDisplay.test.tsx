import React from 'react';
import {render} from 'enzyme';
import ItemsTitleDisplay from './ItemsTitleDisplay';

describe('ItemsTitleDisplay', () => {
    test('Snapshot test', async () => {
        const comp = render(<ItemsTitleDisplay />);

        expect(comp).toMatchSnapshot();
    });
});
