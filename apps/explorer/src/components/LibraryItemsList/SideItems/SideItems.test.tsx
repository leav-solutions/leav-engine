// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {TypeSideItem} from '../../../_types/types';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import SideItems from './SideItems';

jest.mock(
    '../FiltersPanel',
    () =>
        function FiltersPanel() {
            return <div>FiltersPanel</div>;
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
        await act(async () => {
            render(
                <MockStateItems stateItems={{sideItems: {visible: true, type: TypeSideItem.filters}}}>
                    <SideItems />
                </MockStateItems>
            );
        });

        const element = await screen.findByText('FiltersPanel');

        expect(element).toBeInTheDocument();
    });

    test('should have ViewPanel', async () => {
        await act(async () => {
            render(
                <MockStateItems stateItems={{sideItems: {visible: true, type: TypeSideItem.view}}}>
                    <SideItems />
                </MockStateItems>
            );
        });

        const element = await screen.findByText('ViewPanel');

        expect(element).toBeInTheDocument();
    });
});
