import {render} from 'enzyme';
import React from 'react';
import {DndProvider} from 'react-dnd';
import {TestBackend} from 'react-dnd-test-backend';
import {initialState} from '../formBuilderReducer/_fixtures/fixtures';
import ElementsReserve from './ElementsReserve';

jest.mock('./LayoutElementsList', () => {
    return function LayoutElementsList() {
        return <div>LayoutElementsList</div>;
    };
});

jest.mock('./AttributesList', () => {
    return function AttributesList() {
        return <div>AttributesList</div>;
    };
});

describe('ElementsReserve', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <DndProvider backend={TestBackend}>
                <ElementsReserve dispatch={jest.fn()} state={initialState} />
            </DndProvider>
        );

        expect(comp).toMatchSnapshot();
    });
});
