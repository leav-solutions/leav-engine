// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockSharedSearchSelection} from '__mocks__/stateFilters/mockSharedSelection';
import {MockStateShared} from '__mocks__/stateShared/mockStateShared';
import CellSelection from './CellSelection';

describe('CellSelection', () => {
    test('should contain hidden-checkbox', async () => {
        await act(async () => {
            render(<CellSelection index="0" selectionData={{id: 'id', library: 'library', label: 'label'}} />);
        });

        expect(screen.getByTestId('hidden-checkbox')).toBeInTheDocument();
    });

    test('should contain checkbox', async () => {
        await act(async () => {
            render(
                <MockStateShared stateShared={{selection: mockSharedSearchSelection}}>
                    <CellSelection index="0" selectionData={{id: 'id', library: 'library', label: 'label'}} />
                </MockStateShared>
            );
        });

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
});
