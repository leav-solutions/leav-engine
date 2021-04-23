// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockActiveTree} from '__mocks__/common/activeTree';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import DefaultActions from './DefaultActions';

describe('DefaultActions', () => {
    test('should contain dropdown', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <DefaultActions activeTree={mockActiveTree} isDetail={false} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByTestId('dropdown-tree-actions')).toBeInTheDocument();
    });
});
