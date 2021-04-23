// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {displayInitialState} from 'redux/display';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {DisplaySize} from '../../../_types/types';
import DisplayOptions from './DisplayOptions';

describe('DisplayOptions', () => {
    test('should display list-big icon', async () => {
        await act(async () => {
            const mockState = {display: {...displayInitialState, size: DisplaySize.big}};
            render(
                <MockStore state={mockState}>
                    <DisplayOptions />
                </MockStore>
            );
        });

        expect(screen.getByRole('button', {name: 'items_list.display.list-big'})).toBeInTheDocument();
    });
});
