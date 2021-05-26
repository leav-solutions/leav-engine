// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockTreeElement} from '../../__mocks__/common/treeElements';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import ActiveCellNavigation from './ActiveCellNavigation';

describe('ActiveCellNavigation', () => {
    test('should display the label of the record', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <ActiveCellNavigation treeElement={mockTreeElement} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText(mockTreeElement.record.whoAmI.label)).toBeInTheDocument();
    });
});
