import React from 'react';
import {render} from 'enzyme';
import TopBar from './TopBar';

describe('TopBar', () => {
    test('Snapshot test', async () => {
        const comp = render(<TopBar />);

        expect(comp).toMatchSnapshot();
    });
});
