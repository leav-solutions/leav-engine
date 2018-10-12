import * as React from 'react';
import {create} from 'react-test-renderer';
import Loading from './Loading';

describe('Loading', () => {
    test('Snapshot test', async () => {
        const comp = create(<Loading />);

        expect(comp).toMatchSnapshot();
    });
});
