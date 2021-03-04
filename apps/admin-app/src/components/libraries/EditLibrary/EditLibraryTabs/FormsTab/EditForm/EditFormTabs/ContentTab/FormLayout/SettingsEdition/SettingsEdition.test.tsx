// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';
import * as useFormBuilderReducer from '../../formBuilderReducer/hook/useFormBuilderReducer';
import {formElem1, mockInitialState} from '../../formBuilderReducer/_fixtures/fixtures';
import {formElements} from '../../uiElements';
import {FieldTypes, FormElementSettingsInputTypes} from '../../_types';
import SettingsEdition from './SettingsEdition';

jest.mock('components/attributes/AttributeSelector', () => {
    return function AttributeSelector() {
        return <div>AttributeSelector</div>;
    };
});
jest.mock('react-rte');

const mockState = {
    ...mockInitialState,
    openSettings: true
};

describe('SettingsEdition', () => {
    test('Text Input', async () => {
        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myinput',
                                inputType: FormElementSettingsInputTypes.INPUT
                            }
                        ]
                    },
                    settings: {myinput: 'input value'}
                }
            },
            dispatch: jest.fn()
        });

        render(<SettingsEdition />);

        expect(screen.getByRole('textbox')).toHaveDisplayValue('input value');
    });

    test('Select', async () => {
        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'mySelect',
                                inputType: FormElementSettingsInputTypes.SELECT,
                                options: ['option1', 'option2']
                            }
                        ]
                    },
                    settings: {mySelect: 'option1'}
                }
            },
            dispatch: jest.fn()
        });

        render(<SettingsEdition />);

        expect(screen.getByRole('option', {name: /option1/i})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: /option2/i})).toBeInTheDocument();
        expect(!!screen.getByRole('option', {name: /option1/i}).attributes['aria-selected'].value).toBe(true);
    });

    test('Checkbox', async () => {
        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myCheckbox',
                                inputType: FormElementSettingsInputTypes.CHECKBOX
                            }
                        ]
                    },
                    settings: {myCheckbox: true}
                }
            },
            dispatch: jest.fn()
        });

        render(<SettingsEdition />);

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    test('Attribute', async () => {
        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myAttribute',
                                inputType: FormElementSettingsInputTypes.ATTRIBUTE_SELECTION
                            }
                        ]
                    },
                    settings: {attribute: 'test_attribute'}
                }
            },
            dispatch: jest.fn()
        });

        render(<SettingsEdition />);

        expect(screen.getByText('AttributeSelector')).toBeInTheDocument();
    });

    test('RTE', async () => {
        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myRTE',
                                inputType: FormElementSettingsInputTypes.RTE
                            }
                        ]
                    },
                    settings: {myRTE: '**Content**'}
                }
            },
            dispatch: jest.fn()
        });

        render(<SettingsEdition />);

        expect(screen.getByTestId('rte-editor-wrapper')).toBeInTheDocument();
    });

    test('None', async () => {
        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockReturnValue({
            state: {
                ...mockState,
                elementInSettings: {
                    ...formElem1,
                    uiElement: {
                        ...formElements[FieldTypes.TEXT_INPUT],
                        settings: [
                            {
                                name: 'myNoDisplaySettings',
                                inputType: FormElementSettingsInputTypes.NONE
                            }
                        ]
                    },
                    settings: {myNoDisplaySettings: 'some_value'}
                }
            },
            dispatch: jest.fn()
        });

        render(<SettingsEdition />);

        expect(screen.getByRole('form')).toHaveTextContent('');
    });
});
