// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {render, screen, waitFor} from '@testing-library/react';
import {getAttributeByIdQuery} from 'queries/attributes/getAttributeById';
import React from 'react';
import {mockAttrSimple} from '__mocks__/attributes';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import * as useFormBuilderReducer from '../../formBuilderReducer/hook/useFormBuilderReducer';
import {formElem1, mockInitialState} from '../../formBuilderReducer/_fixtures/fixtures';
import {formElements} from '../../uiElements';
import {FieldTypes, FormElementSettingsInputTypes} from '../../_types';
import SettingsEdition from './SettingsEdition';

jest.mock('components/attributes/AttributeSelector', () => function AttributeSelector() {
        return <div>AttributeSelector</div>;
    });
jest.mock('react-rte');

const mockState = {
    ...mockInitialState,
    openSettings: true
};

const renderWithAttributesMock = (children: JSX.Element) => {
    const mocks = [
        {
            request: {
                query: getAttributeByIdQuery,
                variables: {
                    id: formElem1.settings.attribute
                }
            },
            result: {
                data: {
                    attributes: {
                        __typename: 'AttributesList',
                        totalCount: 0,
                        list: [
                            {
                                ...mockAttrSimple,
                                __typename: 'Attribute',
                                id: formElem1.settings.attribute,
                                versions_conf: null
                            }
                        ]
                    }
                }
            }
        }
    ];

    return render(<MockedProviderWithFragments mocks={mocks}>{children}</MockedProviderWithFragments>);
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
                    settings: {...formElem1.settings, myinput: 'input value'}
                }
            },
            dispatch: jest.fn()
        });

        renderWithAttributesMock(<SettingsEdition />);

        await waitFor(() => screen.getByRole('textbox'));

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
                                getInputSettings: () => ({
                                    options: ['option1', 'option2']
                                })
                            }
                        ]
                    },
                    settings: {...formElem1.settings, mySelect: 'option1'}
                }
            },
            dispatch: jest.fn()
        });

        renderWithAttributesMock(<SettingsEdition />);

        await waitFor(() => screen.getAllByRole('option'));

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
                    settings: {...formElem1.settings, myCheckbox: true}
                }
            },
            dispatch: jest.fn()
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByRole('checkbox'));

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
                    settings: {...formElem1.settings}
                }
            },
            dispatch: jest.fn()
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByText('AttributeSelector'));

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
                    settings: {...formElem1.settings, myRTE: '**Content**'}
                }
            },
            dispatch: jest.fn()
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByTestId('rte-editor-wrapper'));

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
                    settings: {...formElem1.settings, myNoDisplaySettings: 'some_value'}
                }
            },
            dispatch: jest.fn()
        });

        renderWithAttributesMock(<SettingsEdition />);
        await waitFor(() => screen.getByRole('form'));

        expect(screen.getByRole('form')).toHaveTextContent('');
    });
});
