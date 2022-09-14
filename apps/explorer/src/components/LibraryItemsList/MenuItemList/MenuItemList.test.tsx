// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockLibraryPermissions} from '__mocks__/common/library';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
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

jest.mock('../SearchItems', () => {
    return function SearchItems() {
        return <div>SearchItems</div>;
    };
});

jest.mock('../DisplayOptions', () => {
    return function DisplayOptions() {
        return <div>DisplayOptions</div>;
    };
});

jest.mock('../../../hooks/ActiveLibHook/ActiveLibHook', () => ({
    useActiveLibrary: () => [{id: 'test', permissions: mockLibraryPermissions}, jest.fn()]
}));

describe('MenuItemList', () => {
    test('should have MenuView', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList refetch={jest.fn()} library={mockGetLibraryDetailExtendedElement} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuView')).toBeInTheDocument();
    });

    test('should have MenuSelection', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList refetch={jest.fn()} library={mockGetLibraryDetailExtendedElement} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuSelection')).toBeInTheDocument();
    });

    test('should have SearchItems', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList refetch={jest.fn()} library={mockGetLibraryDetailExtendedElement} />
            </MockSearchContextProvider>
        );

        expect(await screen.findByText('SearchItems')).toBeInTheDocument();
    });

    test('should have DisplayOptions', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList refetch={jest.fn()} library={mockGetLibraryDetailExtendedElement} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('DisplayOptions')).toBeInTheDocument();
    });

    test('should have menu item actions', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList refetch={jest.fn()} library={mockGetLibraryDetailExtendedElement} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuItemActions')).toBeInTheDocument();
    });
});
