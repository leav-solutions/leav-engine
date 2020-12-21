// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {initialState} from '../../../formBuilderReducer/_fixtures/fixtures';
import {layoutElements} from '../../../uiElements/__mocks__';
import {UIElementTypes} from '../../../_types';
import ReserveLayoutElement from './ReserveLayoutElement';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useLayoutEffect: jest.requireActual('react').useEffect
}));

describe('ReserveLayoutElement', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ReserveLayoutElement
                    element={layoutElements[UIElementTypes.DIVIDER]}
                    dispatch={jest.fn()}
                    state={initialState}
                />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
