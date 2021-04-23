// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import mocksGetViewsListQuery from '../../../__mocks__/mockQuery/mockGetViewListQuery';
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
                    <MockStore>
                        <EditView visible={true} onClose={jest.fn()} id={'id'} />
                    </MockStore>
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
