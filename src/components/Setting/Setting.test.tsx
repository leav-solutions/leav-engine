import React from 'react';
import {render} from 'enzyme';
import Setting from './Setting';

describe('Setting', () => {
    test('Snapshot test', async () => {
        const comp = render(<Setting />);

        expect(comp).toMatchSnapshot();
    });
});
