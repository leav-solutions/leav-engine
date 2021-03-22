// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {useTranslation} from 'react-i18next';
import {
    mockSharedNavigationSelectionWithNoSelected,
    mockSharedSearchSelection
} from '__mocks__/stateFilters/mockSharedSelection';
import {MockStateShared} from '__mocks__/stateShared/mockStateShared';
import NavigationHeader from './NavigationHeader';

describe('NavigationHeader', () => {
    const {t} = useTranslation();
    test('should display the number of element selected and the type of selection', async () => {
        await act(async () => {
            render(
                <MockStateShared
                    stateShared={{
                        selection: mockSharedSearchSelection
                    }}
                >
                    <NavigationHeader />
                </MockStateShared>
            );
        });

        const nb = mockSharedSearchSelection.selected.length;
        const type = SharedStateSelectionType[mockSharedSearchSelection.type];
        const strToFind = `navigation.header.nb-selection|${nb}|${type}`;

        expect(screen.getByText(strToFind)).toBeInTheDocument();
    });

    test("shouldn't display clear button", async () => {
        await act(async () => {
            render(
                <MockStateShared
                    stateShared={{
                        selection: mockSharedNavigationSelectionWithNoSelected
                    }}
                >
                    <NavigationHeader />
                </MockStateShared>
            );
        });

        expect(screen.queryByTestId('clear-selection-button')).not.toBeInTheDocument();
    });

    test('should display clear button', async () => {
        await act(async () => {
            render(
                <MockStateShared
                    stateShared={{
                        selection: mockSharedSearchSelection
                    }}
                >
                    <NavigationHeader />
                </MockStateShared>
            );
        });

        expect(screen.queryByTestId('clear-selection-button')).toBeInTheDocument();
    });
});
