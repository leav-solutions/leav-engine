// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {TypeSideItem} from '../../../_types/types';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import SideItems from './SideItems';

jest.mock(
    '../Filters',
    () =>
        function Filters() {
            return <div>Filters</div>;
        }
);

jest.mock(
    '../ViewPanel',
    () =>
        function ViewPanel() {
            return <div>ViewPanel</div>;
        }
);

describe('SideItems', () => {
    test('should have Filters', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateItems stateItems={{sideItems: {visible: true, type: TypeSideItem.filters}}}>
                    <SideItems />
                </MockStateItems>
            );
        });

        expect(comp.find('Filters')).toHaveLength(1);
    });

    test('should have ViewPanel', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockStateItems stateItems={{sideItems: {visible: true, type: TypeSideItem.view}}}>
                    <SideItems />
                </MockStateItems>
            );
        });

        expect(comp.find('ViewPanel')).toHaveLength(1);
    });
});
