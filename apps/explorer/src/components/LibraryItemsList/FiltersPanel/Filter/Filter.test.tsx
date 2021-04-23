// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockFilter} from '__mocks__/common/filter';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import Filter from './Filter';

describe('Filter', () => {
    test('should contain filter', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <Filter filter={mockFilter} handleProps={{} as any} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        const element = await screen.findByTestId('filter');

        expect(element).toBeInTheDocument();
    });
});
