import {render} from 'enzyme';
import React from 'react';
import CheckboxField from './CheckboxField';

describe('CheckboxField', () => {
    test('Snapshot test', async () => {
        const comp = render(<CheckboxField settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
