// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render} from 'enzyme';
import ALCConnectors from './ALCConnectors';

describe('ALCConnectors', () => {
    test('Snapshot test', async () => {
        const comp = render(<ALCConnectors inputs={[]} dictionnary={{}} />);

        expect(comp).toMatchSnapshot();
    });
});
