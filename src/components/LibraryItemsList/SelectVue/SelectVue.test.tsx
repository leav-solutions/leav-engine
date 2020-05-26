import React from 'react';
import {render} from 'enzyme';
import SelectVue from './SelectVue';

describe('SelectVue', () => {
    test('Snapshot test', async () => {
        const comp = render(<SelectVue />);

        expect(comp).toMatchSnapshot();
    });
});
