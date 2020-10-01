import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import Container from './Container';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useLayoutEffect: jest.requireActual('react').useEffect
}));

describe('Container', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <Container />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
