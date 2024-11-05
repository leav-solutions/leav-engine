// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_ui/_tests/testUtils';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import mocksGetViewsListQuery from '../../../__mocks__/mockQuery/mockGetViewListQuery';
import MenuView from './MenuView';

describe('SelectView', () => {
    const mocks = mocksGetViewsListQuery('activeLibraryId');
    test('should have Dropdown', async () => {
        await act(async () => {
            render(<MenuView library={mockGetLibraryDetailExtendedElement} />, {mocks});
        });

        const ViewOptionsElement = await screen.findByTestId('dropdown-view-options');

        expect(ViewOptionsElement).toBeInTheDocument();
    });
});
