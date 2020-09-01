import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '../../../_types/types';
import ItemSelected from '../ItemSelected';
import {ListAttributeInitialState} from '../ListAttributesReducer';
import ListItemsSelected from './ListItemsSelected';

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

describe('ListItemsSelected', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <ListItemsSelected
                    stateListAttribute={{
                        ...ListAttributeInitialState,
                        attributesChecked: [
                            {
                                id: 'id',
                                library: 'lib',
                                label: {
                                    en: 'label',
                                    fr: 'label'
                                },
                                type: AttributeType.simple,
                                depth: 0,
                                checked: true
                            }
                        ]
                    }}
                    dispatchListAttribute={jest.fn()}
                />
            );
        });

        expect(comp.find(ItemSelected)).toHaveLength(1);
    });
});
