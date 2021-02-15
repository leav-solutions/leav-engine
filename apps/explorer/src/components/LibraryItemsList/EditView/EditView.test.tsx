// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import mocksGetViewsListQuery from '../../../__mocks__/mockQuery/mockGetViewListQuery';
import {MockStateItems} from '../../../__mocks__/stateItems/mockStateItems';
import EditView from './EditView';

jest.mock('../../../hooks/LangHook/LangHook', () => ({
    useLang: () => [{lang: ['fr', 'FR'], availableLangs: ['fr', 'en']}, jest.fn()]
}));

describe('EditView', () => {
    const mocks = mocksGetViewsListQuery('');
    test('should show two input', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments mocks={mocks}>
                    <MockStateItems>
                        <EditView visible={true} onClose={jest.fn()} id={'id'} />
                    </MockStateItems>
                </MockedProviderWithFragments>
            );

            await waitForElement(() => screen.getByTestId('viewName-input-en'));

            const nameElement = screen.getByTestId('viewName-input-fr');
            const descriptionElement = screen.getByTestId('description-input-en');
            const colorElement = screen.getByTestId('color-input');

            expect(nameElement).toBeInTheDocument();
            expect(descriptionElement).toBeInTheDocument();
            expect(colorElement).toBeInTheDocument();
        });
    });
});
