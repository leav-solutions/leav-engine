// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitForElement} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import AddView from './AddView';

jest.mock('../../../hooks/LangHook/LangHook', () => ({
    useLang: () => [{lang: ['fr', 'FR'], availableLangs: ['fr', 'en']}, jest.fn()]
}));

describe('AddView', () => {
    test('should display 2 input and use IconViewType', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStore>
                        <AddView visible={true} onClose={jest.fn()} />
                    </MockStore>
                </MockedProviderWithFragments>
            );

            await waitForElement(() => screen.getByTestId(`input-viewName-${'fr'}`));

            const viewNameFrElement = screen.getByTestId(`input-viewName-${'fr'}`);
            const descriptionEnElement = screen.getByTestId(`input-description-${'en'}`);
            const typeInputElement = screen.getByTestId('input-type');
            const colorInputElement = screen.getByTestId('input-color');

            expect(viewNameFrElement).toBeInTheDocument();
            expect(descriptionEnElement).toBeInTheDocument();
            expect(typeInputElement).toBeInTheDocument();
            expect(colorInputElement).toBeInTheDocument();
        });
    });
});
