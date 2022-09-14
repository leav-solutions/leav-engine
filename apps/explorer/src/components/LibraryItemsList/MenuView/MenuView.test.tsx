// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import mocksGetViewsListQuery from '../../../__mocks__/mockQuery/mockGetViewListQuery';
import MenuView from './MenuView';

describe('SelectView', () => {
    const mocks = mocksGetViewsListQuery('activeLibraryId');
    test('should have Dropdown', async () => {
        await act(async () => {
            render(<MenuView library={mockGetLibraryDetailExtendedElement} />, {apolloMocks: mocks});
        });

        const ViewOptionsElement = await screen.findByTestId('dropdown-view-options');

        expect(ViewOptionsElement).toBeInTheDocument();
    });
});
