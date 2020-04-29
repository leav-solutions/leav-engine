import React from 'react';
import {render} from 'enzyme';
import LibraryList from './LibraryList';

describe('LibraryList', () => {
    test('Snapshot test', async () => {
        const comp = render(<LibraryList />);

        expect(comp).toMatchSnapshot();
    });
});
