// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import TreeField from './TreeField';

describe('TreeField', () => {
    test('Snapshot test', async () => {
        const comp = render(<TreeField settings={{}} />);

        expect(comp).toMatchSnapshot();
    });
});