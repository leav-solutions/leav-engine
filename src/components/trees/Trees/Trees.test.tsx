import * as React from 'react';
import {create} from 'react-test-renderer';
import Trees from './Trees';

describe('Trees', () => {
    test('Snapshot test', async () => {
        const comp = create(<Trees />);

        expect(comp).toMatchSnapshot();
    });
});
