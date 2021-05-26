// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockTreeElements} from '../../__mocks__/common/treeElements';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
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
                <MockStore>
                    <ColumnNavigation treeElements={mockTreeElements} />
                </MockStore>
            </MockedProviderWithFragments>
        );

        const element = await waitForElement(async () => screen.findByText('ActiveCellNavigation'));

        expect(element).toBeInTheDocument();
    });
});
