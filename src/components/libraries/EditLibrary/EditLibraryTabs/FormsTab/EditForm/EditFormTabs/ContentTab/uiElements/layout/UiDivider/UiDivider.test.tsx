import {render} from 'enzyme';
import React from 'react';
import UiDivider from './UiDivider';

describe('UiDivider', () => {
    test('Snapshot test', async () => {
        const comp = render(<UiDivider settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
