// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import MenuItemList from './MenuItemList';

jest.mock('../MenuView', () => () => <div>MenuView</div>);

jest.mock('../MenuSelection', () => () => <div>MenuSelection</div>);

jest.mock('../SearchItems', () => () => <div>SearchItems</div>);

jest.mock('../DisplayOptions', () => () => <div>DisplayOptions</div>);

describe('MenuItemList', () => {
    test('should have MenuView', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuView')).toBeInTheDocument();
    });

    test('should have MenuSelection', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('MenuSelection')).toBeInTheDocument();
    });

    test('should have SearchItems', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(await screen.findByText('SearchItems')).toBeInTheDocument();
    });

    test('should have DisplayOptions', async () => {
        render(
            <MockSearchContextProvider>
                <MenuItemList
                    notifyNewCreation={jest.fn()}
                    refetch={jest.fn()}
                    library={mockGetLibraryDetailExtendedElement}
                />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('DisplayOptions')).toBeInTheDocument();
    });
});
