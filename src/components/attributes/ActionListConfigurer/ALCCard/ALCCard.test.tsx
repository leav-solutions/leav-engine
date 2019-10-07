import React from 'react';
import {render} from 'enzyme';
import ALCCard from './ALCCard';
import {DndProvider} from 'react-dnd-cjs';
import TestBackend from 'react-dnd-test-backend-cjs';
// import HTML5Backend from 'react-dnd-html5-backend-cjs';

function placeholder() {
    return undefined;
}

jest.mock('react-dnd-cjs', () => ({
    useDrag: ({}) => {
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
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ALCCard
                    id={'0'}
                    action={{
                        id: 0,
                        name: 'action',
                        description: 'action',
                        input_types: [],
                        output_types: [],
                        params: [],
                        isSystem: false
                    }}
                    origin="ALCList"
                    addActionToList={placeholder}
                    colorTypeDictionnary={{int: []}}
                />
            </DndProvider>
        );
        expect(comp).toMatchSnapshot();
    });
});
