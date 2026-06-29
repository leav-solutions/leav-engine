import {render, screen} from '_ui/_tests/testUtils';
import {DSColorPickerWrapper} from './DSColorPickerWrapper';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {type CalculatedFlags, type InheritedFlags} from '../../shared/calculatedInheritedFlags';

const pinkColorHex = '#ff00ff';
const pinkColorRgb = 'rgb(255,0,255)';
const pinkColorHsb = 'hsb(300, 100%, 100%)';
const blueColorHex = '#0000ff';

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
            raw_payload: pinkColorHex,
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
            raw_payload: pinkColorHex,
        },
    ],
};

const notReadonly = false;

describe('DSColorPickerWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();
    const mockHandleBlur = jest.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
        mockHandleBlur.mockReset();
    });

    test.each([pinkColorHex, pinkColorRgb, pinkColorHsb])(
        'Should display the presentationValue (%s)',
        async presentationValue => {
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
                            value={pinkColorHex}
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

            expect(screen.getByText(presentationValue)).toBeVisible();
        },
    );

    test.each([pinkColorHex, pinkColorRgb, pinkColorHsb])(
        'Should display the value (%s) if presentationValue is empty',
        async value => {
            render(
                <AntForm>
                    <AntForm.Item>
                        <DSColorPickerWrapper
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

            expect(screen.getByText(value)).toBeVisible();
        },
    );

    test('Should display the value if focused', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
                        value={blueColorHex}
                        presentationValue={pinkColorHex}
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

        const colorPicker = screen.getByTestId(mockFormAttribute.id);
        await user.click(colorPicker);

        expect(screen.getByText(blueColorHex)).toBeVisible();
    });

    test('Should not submit if field has not changed', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
                        value={blueColorHex}
                        presentationValue={pinkColorHex}
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

        const colorPicker = screen.getByTestId(mockFormAttribute.id);
        await user.click(colorPicker);
        await user.tab();

        expect(mockOnChange).not.toHaveBeenCalled();
        expect(mockHandleSubmit).not.toHaveBeenCalled();
    });

    test('Should submit the value if field is not empty', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
                        value={pinkColorHex}
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

        const colorPicker = screen.getByTestId(mockFormAttribute.id);
        await user.click(colorPicker);

        const input = screen.getByRole('textbox');
        await user.clear(input);
        await user.type(input, pinkColorHex);
        await user.click(document.body);

        expect(mockHandleSubmit).toHaveBeenCalledWith(pinkColorHex, mockFormAttribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });

    test("Should allow to clear input when it's inherited and override", async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
                        value={inheritedFlagsWithInheritedValue.inheritedValues[0].raw_payload}
                        presentationValue={inheritedFlagsWithInheritedValue.inheritedValues[0].raw_payload}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const colorPicker = screen.getByTestId(mockFormAttribute.id);
        await user.click(colorPicker);

        const clearButton = screen.getByLabelText('clear');
        await user.click(clearButton);

        expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });

    test("Should allow to clear input when it's calculated and override", async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSColorPickerWrapper
                        value={calculatedFlagsWithCalculatedValue.calculatedValues[0].raw_payload}
                        presentationValue={calculatedFlagsWithCalculatedValue.calculatedValues[0].raw_payload}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>,
        );

        const colorPicker = screen.getByTestId(mockFormAttribute.id);
        await user.click(colorPicker);

        const clearButton = screen.getByLabelText('clear');
        await user.click(clearButton);

        expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });
});
