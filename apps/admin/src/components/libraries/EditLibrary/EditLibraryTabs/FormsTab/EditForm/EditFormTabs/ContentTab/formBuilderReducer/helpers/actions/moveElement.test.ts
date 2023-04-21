// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {formBuilderReducer} from '../..';
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    FormBuilderActionTypes
} from '../../formBuilderReducer';
import {formElem1, formElem4, mockInitialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    describe('MOVE_ELEMENT', () => {
        test('Layout element', async () => {
            const newState = formBuilderReducer(mockInitialState, {
                type: FormBuilderActionTypes.MOVE_ELEMENT,
                elementId: '123457',
                from: {order: 2, containerId: defaultContainerId},
                to: {order: 0, containerId: defaultContainerId}
            });

            expect(newState.elements[defaultDepAttribute][defaultDepValue][defaultContainerId][0].id).toBe('123457');
        });

        test('Field element, same container', async () => {
            const newState = formBuilderReducer(mockInitialState, {
                type: FormBuilderActionTypes.MOVE_ELEMENT,
                elementId: '987654',
                from: {order: 0, containerId: '123456'},
                to: {order: 1, containerId: '123456'}
            });

            const containerFields = newState.elements[defaultDepAttribute][defaultDepValue]['123456'];

            expect(containerFields.map(el => el.id)).toEqual([formElem4.id, formElem1.id]);
            expect(containerFields[0].order).toBe(0);
            expect(containerFields[1].order).toBe(1);
        });

        test('Field element, different container', async () => {
            const newState = formBuilderReducer(mockInitialState, {
                type: FormBuilderActionTypes.MOVE_ELEMENT,
                elementId: '987654',
                from: {order: 0, containerId: '123456'},
                to: {order: 1, containerId: '123457'}
            });

            const containerFrom = newState.elements[defaultDepAttribute][defaultDepValue]['123456'];
            const containerTo = newState.elements[defaultDepAttribute][defaultDepValue]['123457'];

            const elemAtPosFrom = containerFrom.find(el => el.id === '987654');
            expect(elemAtPosFrom).toBeUndefined();
            expect(containerFrom.length).toBe(1);
            expect(containerFrom[0].order).toBe(0);

            const elemAtPosTo = containerTo.find(el => el.id === '987654');
            expect(elemAtPosTo).toBeDefined();
            expect(elemAtPosTo!.containerId).toBe('123457');
            expect(elemAtPosTo!.order).toBe(1);
            expect(containerTo[0].order).toBe(0);
            expect(containerTo[1].order).toBe(1);
        });
    });
});
