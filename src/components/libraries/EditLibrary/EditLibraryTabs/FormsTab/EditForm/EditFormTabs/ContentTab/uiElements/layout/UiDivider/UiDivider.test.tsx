import React from 'react';
import {render} from 'enzyme';
import UiDivider from './UiDivider';

describe('UiDivider', () => {
    test('Snapshot test', async () => {
        const comp = render(<UiDivider />);

        expect(comp).toMatchSnapshot();
    });
});