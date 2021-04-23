// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {useTranslation} from 'react-i18next';
import {selectionInitialState} from 'redux/selection';
import {SharedStateSelectionType} from '_types/types';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockSharedNavigationSelectionWithNoSelected, mockSharedSearchSelection} from '__mocks__/common/selection';
import NavigationHeader from './NavigationHeader';

describe('NavigationHeader', () => {
    const {t} = useTranslation();
    test('should display the number of element selected and the type of selection', async () => {
        const mockState = {selection: {...selectionInitialState, selection: mockSharedSearchSelection}};
        await act(async () => {
            render(
                <MockStore state={mockState}>
                    <NavigationHeader />
                </MockStore>
            );
        });

        const nb = mockSharedSearchSelection.selected.length;
        const type = SharedStateSelectionType[mockSharedSearchSelection.type];
        const strToFind = `navigation.header.nb-selection|${nb}|search.type.${type}`;

        expect(screen.getByText(strToFind)).toBeInTheDocument();
    });

    test("shouldn't display clear button", async () => {
        await act(async () => {
            render(
                <MockStore
                    state={{
                        selection: {...selectionInitialState, selection: mockSharedNavigationSelectionWithNoSelected}
                    }}
                >
                    <NavigationHeader />
                </MockStore>
            );
        });

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('should display clear button', async () => {
        await act(async () => {
            render(
                <MockStore
                    state={{
                        selection: {...selectionInitialState, selection: mockSharedSearchSelection}
                    }}
                >
                    <NavigationHeader />
                </MockStore>
            );
        });

        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
