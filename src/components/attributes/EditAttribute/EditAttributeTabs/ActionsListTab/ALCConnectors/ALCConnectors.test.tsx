import React from 'react';
import {render} from 'enzyme';
import ALCConnectors from './ALCConnectors';

describe('ALCConnectors', () => {
    test('Snapshot test', async () => {
        const comp = render(<ALCConnectors inputs={[]} dictionnary={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
