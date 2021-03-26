// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {mockTreeElements} from '../../__mocks__/Navigation/mockTreeElements';
import ColumnNavigation from './ColumnNavigation';

jest.mock(
    '../ActiveCellNavigation',
    () =>
        function ActiveCellNavigation() {
            return <div>ActiveCellNavigation</div>;
        }
);

describe('ColumnNavigation', () => {
    test('should call CellNavigation', async () => {
        render(
            <MockedProviderWithFragments>
                <ColumnNavigation treeElements={mockTreeElements} />
            </MockedProviderWithFragments>
        );

        const element = await waitForElement(async () => screen.findByText('ActiveCellNavigation'));

        expect(element).toBeInTheDocument();
    });
});
