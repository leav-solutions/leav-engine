// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import {displayInitialState} from 'reduxStore/display';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {TypeSideItem} from '../../../_types/types';
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
            const mockState = {
                side: {visible: true, type: TypeSideItem.filters}
            };

            render(
                <MockStore state={{display: {...displayInitialState, ...mockState}}}>
                    <SideItems />
                </MockStore>
            );
        });

        const element = await screen.findByText('FiltersPanel');

        expect(element).toBeInTheDocument();
    });

    test('should have ViewPanel', async () => {
        await act(async () => {
            const mockState = {
                side: {visible: true, type: TypeSideItem.view}
            };

            render(
                <MockStore state={{display: {...displayInitialState, ...mockState}}}>
                    <SideItems />
                </MockStore>
            );
        });

        const element = await screen.findByText('ViewPanel');

        expect(element).toBeInTheDocument();
    });
});
