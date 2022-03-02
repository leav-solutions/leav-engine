// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockLibraryPermissions} from '__mocks__/common/library';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import MenuItemList from './MenuItemList';

jest.mock(
    '../MenuView',
    () =>
        function MenuView() {
            return <div>MenuView</div>;
        }
);

jest.mock('../MenuSelection', () => {
    return function MenuSelection() {
        return <div>MenuSelection</div>;
    };
});

jest.mock('../MenuItemActions', () => {
    return function MenuItemActions() {
        return <div>MenuItemActions</div>;
    };
});

jest.mock('../../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [{id: 'test', permissions: mockLibraryPermissions}, jest.fn()]
}));

describe('MenuItemList', () => {
    test('should have MenuView', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MockSearchContextProvider>
                            <MenuItemList refetch={jest.fn()} />
                        </MockSearchContextProvider>
                    </MockStore>
                </MockedProviderWithFragments>
            );

            await waitFor(() => screen.getByText('MenuView'));

            const menuViewMockContent = screen.getByText('MenuView');

            expect(menuViewMockContent).toBeInTheDocument();
        });
    });

    test('should have MenuSelection', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MockSearchContextProvider>
                            <MenuItemList refetch={jest.fn()} />
                        </MockSearchContextProvider>
                    </MockStore>
                </MockedProviderWithFragments>
            );

            await waitFor(() => screen.getByText('MenuSelection'));

            const menuSelectionMockContent = screen.getByText('MenuSelection');

            expect(menuSelectionMockContent).toBeInTheDocument();
        });
    });

    test('should have SearchItems', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MockSearchContextProvider>
                            <MenuItemList refetch={jest.fn()} />
                        </MockSearchContextProvider>
                    </MockStore>
                </MockedProviderWithFragments>
            );

            expect(comp.find('SearchItems')).toHaveLength(1);
        });
    });

    test('should have DisplayOptions', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MockSearchContextProvider>
                            <MenuItemList refetch={jest.fn()} />
                        </MockSearchContextProvider>
                    </MockStore>
                </MockedProviderWithFragments>
            );

            expect(comp.find('DisplayOptions')).toHaveLength(1);
        });
    });

    test('should have menu item actions', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <MockSearchContextProvider>
                            <MenuItemList refetch={jest.fn()} />
                        </MockSearchContextProvider>
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('MenuItemActions')).toHaveLength(1);
    });
});
