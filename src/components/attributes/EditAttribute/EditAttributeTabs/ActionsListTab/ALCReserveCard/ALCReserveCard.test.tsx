import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import ALCReserveCard from './ALCReserveCard';

function placeholder() {
    return undefined;
}

jest.mock('react-dnd', () => ({
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

describe('ALCReserveCard', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ALCReserveCard
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
