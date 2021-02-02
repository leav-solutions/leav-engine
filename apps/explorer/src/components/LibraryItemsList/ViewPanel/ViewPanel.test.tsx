// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {mount} from 'enzyme';
import ViewPanel from './ViewPanel';
import {act} from 'react-dom/test-utils';

describe('ViewPanel', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<ViewPanel />);
        });

        expect(comp);
    });
});
