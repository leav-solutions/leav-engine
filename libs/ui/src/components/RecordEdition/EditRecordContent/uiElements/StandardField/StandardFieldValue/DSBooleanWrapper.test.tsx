// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {AntForm} from 'aristid-ds';
import {DSBooleanWrapper} from './DSBooleanWrapper';
import {
    InheritedFlags,
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {VersionFieldScope} from '../../../_types';
import userEvent from '@testing-library/user-event';

const en_label = 'label';
const fr_label = 'libellé';
const idValue = '123';
const mockValueFalse = {
    index: 0,
    displayValue: null,
    editingValue: null,
    originRawValue: null,
    idValue: null,
    isEditing: false,
    isErrorDisplayed: false,
    value: {
        id_value: null,
        value: null,
        raw_value: null,
        modified_at: null,
        created_at: null,
        created_by: null,
        modified_by: null
    },
    version: null,
    error: '',
    state: StandardFieldValueState.PRISTINE
};

const inheritedValues = [
    {
        isInherited: null,
        value: false,
        raw_value: false
    },
    {
        isInherited: true,
        value: true,
        raw_value: true
    }
];

const inheritedNotOverrideValue: InheritedFlags = {
    isInheritedValue: true,
    isInheritedOverrideValue: false,
    isInheritedNotOverrideValue: true,
    inheritedValue: {raw_value: inheritedValues[1].raw_value}
};

const inheritedOverrideValue: InheritedFlags = {
    isInheritedValue: true,
    isInheritedOverrideValue: true,
    isInheritedNotOverrideValue: false,
    inheritedValue: {raw_value: inheritedValues[1].raw_value}
};

const getInitialState = ({
    required,
    fallbackLang
}: {
    required: boolean;
    fallbackLang: boolean;
}): IStandardFieldReducerState => ({
    record: mockRecord,
    formElement: {
        ...mockFormElementInput,
        settings: {
            label: fallbackLang ? {en: en_label} : {fr: fr_label, en: en_label},
            required
        }
    },
    attribute: mockFormAttribute,
    isReadOnly: false,
    activeScope: VersionFieldScope.CURRENT,
    values: {
        [VersionFieldScope.CURRENT]: {
            version: null,
            values: {[idValue]: mockValueFalse}
        },
        [VersionFieldScope.INHERITED]: null
    },
    metadataEdit: false,
    inheritedValue: null,
    isInheritedNotOverrideValue: false,
    isInheritedOverrideValue: false,
    isInheritedValue: false
});

describe('DSBooleanWrapper', () => {
    let user!: ReturnType<typeof userEvent.setup>;
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();

    beforeEach(() => {
        user = userEvent.setup({});
        mockHandleSubmit.mockReset();
        mockOnChange.mockReset();
    });

    test('Should display boolean with fr label', async () => {
        const state = getInitialState({required: false, fallbackLang: false});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper state={state} handleSubmit={mockHandleSubmit} onChange={mockOnChange} />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(fr_label)).toBeVisible();
    });

    test('Should display boolean with fallback label', async () => {
        const state = getInitialState({required: false, fallbackLang: true});
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper state={state} handleSubmit={mockHandleSubmit} onChange={mockOnChange} />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(en_label)).toBeVisible();
    });

    test('Should display boolean value as yes', async () => {
        const state = getInitialState({required: false, fallbackLang: false});

        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={true}
                        state={state}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(/yes/)).toBeVisible();
    });

    test('Should display boolean value as no', async () => {
        const state = getInitialState({required: false, fallbackLang: false});

        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        state={state}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(/no/)).toBeVisible();
    });

    test('Should submit true if the switch was set to false', async () => {
        const state = getInitialState({required: false, fallbackLang: false});

        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        state={state}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const switchInput = screen.getByRole('switch');
        await user.click(switchInput);

        expect(mockHandleSubmit).toHaveBeenCalledWith('true', state.attribute.id);
    });

    test('Should submit false if the switch was set to true', async () => {
        const state = getInitialState({required: false, fallbackLang: false});

        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={true}
                        state={state}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const switchInput = screen.getByRole('switch');
        await user.click(switchInput);

        expect(mockHandleSubmit).toHaveBeenCalledWith('false', state.attribute.id);
    });

    describe('With inheritance', () => {
        test('Should display inherited value', async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...inheritedNotOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSBooleanWrapper
                            value={inheritedValues[1].raw_value}
                            state={state}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            expect(screen.getByText(/yes/)).toBeVisible();
        });

        test('Should display override value, clear icon and inherited value under it', async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSBooleanWrapper
                            value={inheritedValues[0].raw_value}
                            state={state}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            expect(screen.getByText(/no/)).toBeVisible();

            const helperText = screen.getByText(/inherited_input_helper/);
            expect(helperText).toBeInTheDocument();
        });

        test('Should allow to clear override value', async () => {
            let state = getInitialState({required: false, fallbackLang: false});
            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            render(
                <AntForm>
                    <AntForm.Item>
                        <DSBooleanWrapper
                            value={inheritedValues[0].raw_value}
                            state={state}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const clearButton = screen.getByRole('button');
            await user.click(clearButton);

            expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        });
    });
});
