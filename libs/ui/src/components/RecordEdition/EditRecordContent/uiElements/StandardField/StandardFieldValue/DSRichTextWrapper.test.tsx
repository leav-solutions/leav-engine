// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockBrowserFunctionsForTiptap, render, screen} from '_ui/_tests/testUtils';
import {DSRichTextWrapper} from './DSRichTextWrapper';
import {FieldScope} from '../../../_types';
import {
    InheritedFlags,
    IStandardFieldReducerState,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockAttributeLink} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';

const en_label = 'label';
const fr_label = 'libellé';
const idValue = '123';
const mockValue = {
    index: 0,
    displayValue: '<p>my <strong>value</strong></p>',
    editingValue: '<p>my <strong>my raw value</strong></p>',
    originRawValue: '<p>my <strong>my raw value</strong></p>',
    idValue: null,
    isEditing: false,
    isErrorDisplayed: false,
    value: {
        id_value: null,
        value: '<p>my <strong>my value</strong></p>',
        raw_value: '<p>my <strong>my raw value</strong></p>',
        modified_at: null,
        created_at: null,
        created_by: null,
        modified_by: null
    },
    version: null,
    error: '',
    state: StandardFieldValueState.PRISTINE
};

const getInitialState = (required: boolean, fallbackLang = false): IStandardFieldReducerState => ({
    record: mockRecord,
    formElement: {
        ...mockFormElementInput,
        settings: {
            label: fallbackLang ? {en: en_label} : {fr: fr_label, en: en_label},
            required
        }
    },
    attribute: mockAttributeLink,
    isReadOnly: false,
    activeScope: FieldScope.CURRENT,
    values: {
        [FieldScope.CURRENT]: {
            version: null,
            values: {[idValue]: mockValue}
        },
        [FieldScope.INHERITED]: null
    },
    metadataEdit: false,
    inheritedValue: null,
    isInheritedNotOverrideValue: false,
    isInheritedOverrideValue: false,
    isInheritedValue: false
});

const inheritedValues = [
    {
        isInherited: null,
        value: 'override value',
        raw_value: 'override value'
    },
    {
        isInherited: true,
        value: 'inherited value',
        raw_value: 'inherited value'
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

const tiptapCleanup = mockBrowserFunctionsForTiptap();

describe('DSRichTextWrapper', () => {
    afterAll(() => {
        tiptapCleanup();
    });

    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();
    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should display input with fr label ', async () => {
        const state = getInitialState(false, false);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        state={state}
                        attribute={{} as RecordFormAttributeFragment}
                        fieldValue={null}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(fr_label)).toBeVisible();
    });

    test('Should display input with fallback label ', async () => {
        const state = getInitialState(false, true);
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        state={state}
                        attribute={{} as RecordFormAttributeFragment}
                        fieldValue={null}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(en_label)).toBeVisible();
    });

    test('Should submit empty value if field is not required', async () => {
        const state = getInitialState(false);
        const {container} = render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        state={state}
                        attribute={{} as RecordFormAttributeFragment}
                        fieldValue={null}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = container.getElementsByClassName('ProseMirror')[0];
        (input as HTMLInputElement).focus();
        await user.click(document.body);

        expect(mockHandleSubmit).toHaveBeenCalledWith('', state.attribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });

    describe('With required input and no inheritance', () => {
        test('Should submit the value if field is not empty', async () => {
            const state = getInitialState(true);
            const {container} = render(
                <AntForm>
                    <AntForm.Item>
                        <DSRichTextWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const text = 'text';
            const input = await container.getElementsByClassName('ProseMirror')[0];
            await user.click(input);
            await user.type(input, text);
            await user.click(document.body);

            expect(mockHandleSubmit).toHaveBeenCalledWith(`<p>${text}</p>`, state.attribute.id);
            expect(mockOnChange).toHaveBeenCalled();
        });

        test('Should submit the default value if field is empty', async () => {
            const state = getInitialState(true);
            const {container} = render(
                <AntForm>
                    <AntForm.Item>
                        <DSRichTextWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            value={mockValue.originRawValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = await container.getElementsByClassName('ProseMirror')[0];
            await user.click(input);
            await user.click(document.body);

            expect(mockHandleSubmit).toHaveBeenCalledWith(mockValue.originRawValue, state.attribute.id);
        });
    });

    describe('With inheritance', () => {
        test("Should display the inherited value by default and not save if we don't change it", async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...inheritedNotOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };
            const {container} = render(
                <AntForm>
                    <AntForm.Item>
                        <DSRichTextWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            value={inheritedValues[1].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = await container.getElementsByClassName('ProseMirror')[0];
            expect(input).toContainHTML(inheritedValues[1].raw_value);

            await user.click(input);
            await user.click(document.body);

            expect(mockHandleSubmit).not.toHaveBeenCalled();
        });

        test('Should display the override value in the input and inherited value under it', async () => {
            let state = getInitialState(false);
            state = {
                ...state,
                ...inheritedOverrideValue,
                formElement: {...state.formElement, values: inheritedValues}
            };

            const {container} = render(
                <AntForm>
                    <AntForm.Item>
                        <DSRichTextWrapper
                            state={state}
                            attribute={{} as RecordFormAttributeFragment}
                            fieldValue={null}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                            value={inheritedValues[0].raw_value}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const input = await container.getElementsByClassName('ProseMirror')[0];

            const helperText = screen.getByText(/inherited value/);
            expect(input).toContainHTML(inheritedValues[0].raw_value);
            expect(helperText).toBeInTheDocument();
        });
    });
});
