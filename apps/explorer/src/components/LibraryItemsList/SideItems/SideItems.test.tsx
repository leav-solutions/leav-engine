// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {mount} from 'enzyme';
import SideItems from './SideItems';
import {act} from 'react-dom/test-utils';

describe('SideItems', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<SideItems />);
        });

        expect(comp);
    });
});
