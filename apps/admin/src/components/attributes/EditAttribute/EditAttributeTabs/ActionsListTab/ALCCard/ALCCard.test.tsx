// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import ALCCard from './ALCCard';

jest.mock('hooks/useLang');

jest.mock('react-dnd', () => ({
    useDrag: () => {
        const isDragging = false;
        const drag = () => true;
        const preview = () => true;
        return [{isDragging}, drag, preview];
    },
    useDrop: sth => {
        const isOver = false;
        const drop = () => true;
        return [{isOver}, drop];
    },
    DndProvider: ({backend, children}) => children
}));

describe('ALCCard', () => {
    test('it shows the correct action name', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ALCCard
                    id="0"
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
