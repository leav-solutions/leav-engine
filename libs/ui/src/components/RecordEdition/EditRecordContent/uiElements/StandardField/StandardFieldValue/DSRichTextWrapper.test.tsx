import {mockBrowserFunctionsForTiptap, render, screen} from '_ui/_tests/testUtils';
import {DSRichTextWrapper} from './DSRichTextWrapper';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {type CalculatedFlags, type InheritedFlags} from '../../shared/calculatedInheritedFlags';

const value = 'Half-blood prince';
const presentationValue = 'Severus Snape';
const newValue = 'Harry Potter';

const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
    isCalculatedValues: false,
    isCalculatedOverrideValues: false,
    isCalculatedNotOverrideValues: false,
    calculatedValues: null,
};

const calculatedFlagsWithCalculatedValue: CalculatedFlags = {
    isCalculatedValues: true,
    isCalculatedOverrideValues: true,
    isCalculatedNotOverrideValues: false,
    calculatedValues: [
        {
            raw_payload: newValue,
        },
    ],
};

const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
    isInheritedValues: false,
    isInheritedOverrideValues: false,
    isInheritedNotOverrideValues: false,
    inheritedValues: null,
};

const inheritedFlagsWithInheritedValue: InheritedFlags = {
    isInheritedValues: true,
    isInheritedOverrideValues: true,
    isInheritedNotOverrideValues: false,
    inheritedValues: [
        {
            raw_payload: newValue,
        },
    ],
};

const notReadonly = false;
const readonly = true;

const tiptapCleanup = mockBrowserFunctionsForTiptap();

describe('DSRichTextWrapper', () => {
    afterAll(() => {
        tiptapCleanup();
    });

    const mockHandleSubmit = vi.fn();
    const mockOnChange = vi.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should display the presentationValue', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const input = screen.getByRole('textbox');
        expect(input).toContainHTML(presentationValue);
    });

    test('Should display the value if presentationValue is empty', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        value={value}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const input = screen.getByRole('textbox');
        expect(input).toContainHTML(value);
    });

    test('Should display the value if focused', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const input = screen.getByRole('textbox');
        await user.click(input);
        expect(input).toContainHTML(value);
    });

    test('Should be disabled when readonly', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={mockFormAttribute}
                        readonly={readonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('contenteditable', 'false');
    });

    test('Should call handleSubmit on blur with new value', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const input = screen.getByRole('textbox');

        await user.click(input);
        await user.type(input, newValue);
        await user.click(document.body);

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockHandleSubmit).toHaveBeenCalledWith(`<p>${newValue}</p>`, mockFormAttribute.id);
    });

    test('Should display the maximum number of characters', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSRichTextWrapper
                        value={value}
                        presentationValue={presentationValue}
                        attribute={{...mockFormAttribute, character_limit: 15}}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        expect(screen.getByText('13 / 15')).toBeInTheDocument();
    });

    describe('Without inherited or calculated flags', () => {
        test('Should submit empty value on clear', async () => {
            render(
                <AntForm initialValues={{inputToTest: value}}>
                    <AntForm.Item name="inputToTest">
                        <DSRichTextWrapper
                            attribute={mockFormAttribute}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            handleSubmit={mockHandleSubmit}
                            onChange={mockOnChange}
                        />
                    </AntForm.Item>
                </AntForm>,
            );

            const input = screen.getByRole('textbox');
            await user.click(input);
            await user.clear(input);
            await user.click(document.body);

            expect(mockOnChange).toHaveBeenCalled();
            expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
        });
    });

    describe('With inherited or calculated value', () => {
        it.each`
            calculatedValue | inheritedValue
            ${'calculated'} | ${null}
            ${null}         | ${'inherited'}
            ${'calculated'} | ${'inherited'}
        `(
            'Should submit empty value on clear and call onChange with inherited value',
            async ({
                calculatedValue,
                inheritedValue,
            }: {
                calculatedValue: string | null;
                inheritedValue: string | null;
            }) => {
                render(
                    <AntForm initialValues={{inputTest: value}}>
                        <AntForm.Item name="inputTest">
                            <DSRichTextWrapper
                                value={value}
                                attribute={mockFormAttribute}
                                readonly={notReadonly}
                                calculatedFlags={
                                    calculatedValue
                                        ? calculatedFlagsWithCalculatedValue
                                        : calculatedFlagsWithoutCalculatedValue
                                }
                                inheritedFlags={
                                    inheritedValue
                                        ? inheritedFlagsWithInheritedValue
                                        : inheritedFlagsWithoutInheritedValue
                                }
                                handleSubmit={mockHandleSubmit}
                                onChange={mockOnChange}
                            />
                        </AntForm.Item>
                    </AntForm>,
                );

                const input = screen.getByRole('textbox');
                await user.click(input);
                await user.clear(input);
                await user.click(document.body);

                expect(mockOnChange).toHaveBeenCalledWith(newValue);
                expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
            },
        );
    });
});
