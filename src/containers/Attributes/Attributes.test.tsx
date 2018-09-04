import * as React from 'react';
import {create} from 'react-test-renderer';
import Attributes from './Attributes';

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const comp = create(<Attributes />);

        expect(comp).toMatchSnapshot();
    });
});
