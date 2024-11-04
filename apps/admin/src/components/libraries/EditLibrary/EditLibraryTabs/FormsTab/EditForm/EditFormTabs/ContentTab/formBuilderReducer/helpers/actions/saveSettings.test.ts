// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {formBuilderReducer} from '../..';
import {defaultDepAttribute, defaultDepValue, FormBuilderActionTypes} from '../../formBuilderReducer';
import {formElem1, mockInitialState} from '../../_fixtures/fixtures';

describe('formBuilderReducer', () => {
    describe('SAVE_SETTNGS', () => {
        test('If no element specified, save settings for element in settings', async () => {
            const newState = formBuilderReducer(
                {...mockInitialState, elementInSettings: {...formElem1}},
                {
                    type: FormBuilderActionTypes.SAVE_SETTINGS,
                    settings: {
                        label: 'foo'
                    }
                }
            );

            expect(
                newState.elements[defaultDepAttribute][defaultDepValue][formElem1.containerId][0]?.settings?.label
            ).toBe('foo');
            expect(newState.activeElements[formElem1.containerId][0]?.settings?.label).toBe('foo');
        });

        test('Save settings for specified element', async () => {
            const newState = formBuilderReducer(
                {...mockInitialState},
                {
                    type: FormBuilderActionTypes.SAVE_SETTINGS,
                    settings: {
                        label: 'foo'
                    },
                    element: {
                        ...formElem1
                    }
                }
            );

            expect(
                newState.elements[defaultDepAttribute][defaultDepValue][formElem1.containerId][0]?.settings?.label
            ).toBe('foo');
            expect(newState.activeElements[formElem1.containerId][0]?.settings?.label).toBe('foo');
        });
    });
});
