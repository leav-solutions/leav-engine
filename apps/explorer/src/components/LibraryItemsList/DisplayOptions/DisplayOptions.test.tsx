// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {DisplayListItemTypes} from '../../../_types/types';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import DisplayOptions from './DisplayOptions';

describe('DisplayOptions', () => {
    test('should display list-big icon', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateItems stateItems={{displayType: DisplayListItemTypes.listBig}}>
                    <DisplayOptions />
                </MockStateItems>
            );
        });

        expect(comp.html()).toContain('items_list.display.list-big');
    });
});
