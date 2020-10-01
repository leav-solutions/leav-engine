import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {initialState} from '../../formBuilderReducer/_fixtures/fixtures';
import LayoutElementsList from './LayoutElementsList';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useLayoutEffect: jest.requireActual('react').useEffect
}));

describe('LayoutElementsList', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <LayoutElementsList dispatch={jest.fn()} state={initialState} />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
