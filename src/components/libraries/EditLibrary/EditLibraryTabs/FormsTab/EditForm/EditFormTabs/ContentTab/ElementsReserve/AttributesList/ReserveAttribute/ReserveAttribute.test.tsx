import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {mockAttrSimple} from '../../../../../../../../../../../__mocks__/attributes';
import {initialState} from '../../../formBuilderReducer/_fixtures/fixtures';
import ReserveAttribute from './ReserveAttribute';

jest.mock('../../../../../../../../../../../hooks/useLang');

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useLayoutEffect: jest.requireActual('react').useEffect
}));

describe('ReserveAttribute', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ReserveAttribute attribute={mockAttrSimple} state={initialState} dispatch={jest.fn()} />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
