import React from 'react';
import {render} from 'enzyme';
import SearchItems from './SearchItems';

describe('SearchItems', () => {
    test('Snapshot test', async () => {
        const comp = render(<SearchItems />);

        expect(comp).toMatchSnapshot();
    });
});
