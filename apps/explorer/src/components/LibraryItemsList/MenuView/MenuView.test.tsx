// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import mocksGetViewsListQuery from '../../../__mocks__/mockQuery/mockGetViewListQuery';
import MenuView from './MenuView';

describe('SelectView', () => {
    const mocks = mocksGetViewsListQuery('activeLibraryId');
    test('should have Dropdown', async () => {
        render(
            <MockedProviderWithFragments mocks={mocks}>
                <MockStore>
                    <MenuView library={mockGetLibraryDetailExtendedElement} />
                </MockStore>
            </MockedProviderWithFragments>
        );

        const ViewOptionsElement = await screen.findByTestId('dropdown-view-options');

        expect(ViewOptionsElement).toBeInTheDocument();
    });
});
