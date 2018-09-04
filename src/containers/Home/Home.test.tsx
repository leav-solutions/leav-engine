import * as React from 'react';
import {create} from 'react-test-renderer';
import Home from './Home';

describe('Home', () => {
    test('Snapshot test', async () => {
        const comp = create(<Home />);

        expect(comp).toMatchSnapshot();
    });
});
