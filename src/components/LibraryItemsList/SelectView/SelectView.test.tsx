import {render} from 'enzyme';
import React from 'react';
import SelectView from './SelectView';

describe('SelectView', () => {
    test('Snapshot test', async () => {
        const comp = render(<SelectView />);

        expect(comp).toMatchSnapshot();
    });
});
