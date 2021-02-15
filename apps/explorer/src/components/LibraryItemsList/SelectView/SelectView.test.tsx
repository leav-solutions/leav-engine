// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import mocksGetViewsListQuery from '../../../__mocks__/mockQuery/mockGetViewListQuery';
import SelectView from './SelectView';

jest.mock(
    '../AddView',
    () =>
        function AddView() {
            return <div>AddView</div>;
        }
);

describe('SelectView', () => {
    const mocks = mocksGetViewsListQuery('');
    test('should have Dropdown', async () => {
        render(
            <MockedProviderWithFragments mocks={mocks}>
                <SelectView />
            </MockedProviderWithFragments>
        );

        const ViewOptionsElement = await screen.findByTestId('dropdown-view-options');

        expect(ViewOptionsElement).toBeInTheDocument();
    });
});
