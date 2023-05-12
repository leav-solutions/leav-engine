// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import ALCCard from './ALCCard';
// import HTML5Backend from 'react-dnd-html5-backend';

function placeholder() {
    return undefined;
}

jest.mock('react-dnd', () => ({
    useDrag: () => {
        const isDragging = false;
        const drag = () => {
            return true;
        };
        const preview = () => {
            return true;
        };
        return [{isDragging}, drag, preview];
    },
    useDrop: sth => {
        const isOver = false;
        const drop = () => {
            return true;
        };
        return [{isOver}, drop];
    },
    DndProvider: ({backend, children}) => children
}));

describe('ALCCard', () => {
    test('it shows the correct action name', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ALCCard
                    id={'0'}
                    action={{
                        id: 'action',
                        list_id: 0,
                        name: 'action',
                        description: 'action',
                        input_types: [],
                        output_types: [],
                        params: [],
                        isSystem: false
                    }}
                    origin="ALCList"
                    colorTypeDictionnary={{int: []}}
                />
            </DndProvider>
        );
        const header = comp.find('h3');
        expect(header.text()).toBe('action');
    });
});
