import React from 'react';
import {render} from 'enzyme';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    test('Snapshot test', async () => {
        const comp = render(<UserMenu />);

        expect(comp).toMatchSnapshot();
    });
});
