// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import DetailActions from './DetailActions';

describe('DetailActions', () => {
    test('should display dropdown', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <DetailActions isDetail={true} depth={0} />
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByRole('dropdown-detail-action')).toBeInTheDocument();
    });
});
