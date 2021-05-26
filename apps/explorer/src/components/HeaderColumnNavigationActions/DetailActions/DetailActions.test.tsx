// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import DetailActions from './DetailActions';

describe('DetailActions', () => {
    test('should display dropdown', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <DetailActions isDetail={true} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByTestId('dropdown-detail-actions')).toBeInTheDocument();
    });

    test('should display close button', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <DetailActions isDetail={true} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
    });
});
