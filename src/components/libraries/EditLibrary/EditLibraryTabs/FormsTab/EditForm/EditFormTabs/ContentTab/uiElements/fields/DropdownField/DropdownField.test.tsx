import {render} from 'enzyme';
import React from 'react';
import DropdownField from './DropdownField';

describe('DropdownField', () => {
    test('Snapshot test', async () => {
        const comp = render(<DropdownField settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
