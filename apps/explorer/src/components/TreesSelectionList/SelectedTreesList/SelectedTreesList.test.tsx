// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import SelectedTree from './SelectedTree/SelectedTree';
import SelectedTreesList from './SelectedTreesList';

jest.mock('react-beautiful-dnd', () => ({
    Droppable: ({children}) =>
        children(
            {
                draggableProps: {
                    style: {}
                },
                innerRef: jest.fn()
            },
            {}
        ),
    Draggable: ({children}) =>
        children(
            {
                draggableProps: {
                    style: {}
                },
                innerRef: jest.fn()
            },
            {}
        ),
    DragDropContext: ({children}) => children
}));

jest.mock('../reducer/treesSelectionListStateContext');

describe('SelectedTreesList', () => {
    test('Render', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <SelectedTreesList />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(SelectedTree)).toHaveLength(1);
    });
});
