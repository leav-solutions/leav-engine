// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SidebarContentType} from '_ui/types/search';
import {act, render, screen} from '_ui/_tests/testUtils';
import {SearchContext} from '../hooks/useSearchReducer/searchContext';
import {initialSearchState} from '../hooks/useSearchReducer/searchReducer';
import Sidebar from './Sidebar';

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
                side: {visible: true, type: SidebarContentType.filters}
            };

            render(
                <SearchContext.Provider
                    value={{
                        state: {...initialSearchState, sideBar: {visible: true, type: SidebarContentType.filters}},
                        dispatch: jest.fn()
                    }}
                >
                    <Sidebar />
                </SearchContext.Provider>
            );
        });

        const element = await screen.findByText('FiltersPanel');

        expect(element).toBeInTheDocument();
    });

    test('should have ViewPanel', async () => {
        render(
            <SearchContext.Provider
                value={{
                    state: {...initialSearchState, sideBar: {visible: true, type: SidebarContentType.view}},
                    dispatch: jest.fn()
                }}
            >
                <Sidebar />
            </SearchContext.Provider>
        );

        const element = await screen.findByText('ViewPanel');

        expect(element).toBeInTheDocument();
    });
});
