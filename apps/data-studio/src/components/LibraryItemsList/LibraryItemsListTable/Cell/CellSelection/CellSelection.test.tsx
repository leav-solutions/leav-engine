// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import {selectionInitialState} from 'reduxStore/selection';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockSharedSearchSelection} from '__mocks__/common/selection';
import CellSelection from './CellSelection';

describe('CellSelection', () => {
    test('should contain checkbox', async () => {
        await act(async () => {
            render(
                <MockStore state={{selection: {...selectionInitialState, selection: mockSharedSearchSelection}}}>
                    <CellSelection selected />
                </MockStore>
            );
        });

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
});
