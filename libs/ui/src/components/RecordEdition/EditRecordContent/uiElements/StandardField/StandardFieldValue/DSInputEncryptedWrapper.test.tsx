// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {DSInputEncryptedWrapper} from './DSInputEncryptedWrapper';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {CalculatedFlags, InheritedFlags} from '../calculatedInheritedFlags';

const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
    isCalculatedValue: false,
    isCalculatedOverrideValue: false,
    isCalculatedNotOverrideValue: false,
    calculatedValue: null
};

const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
    isInheritedValue: false,
    isInheritedOverrideValue: false,
    isInheritedNotOverrideValue: false,
    inheritedValue: null
};

const notRequired = false;
const notReadonly = false;
const readonly = true;

describe('DSInputEncryptedWrapper', () => {
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();

    let user!: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({});
        mockOnChange.mockReset();
        mockHandleSubmit.mockReset();
    });

    test('Should submit the value', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const text = 'text';
        const input = screen.getByTestId('kit-input-password');

        await user.click(input);
        await user.type(input, text);
        await user.tab();

        expect(mockHandleSubmit).toHaveBeenCalledWith(text, mockFormAttribute.id);
        expect(mockOnChange).toHaveBeenCalled();
    });

    test('Should allow to clear input', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
                        value="password"
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );
        const clearButton = screen.getByRole('button');

        await user.click(clearButton);

        expect(mockHandleSubmit).toHaveBeenCalledWith(null, mockFormAttribute.id);
    });

    test('Should be disabled if readonly', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSInputEncryptedWrapper
                        value="password"
                        attribute={mockFormAttribute}
                        required={notRequired}
                        readonly={readonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const input = screen.getByTestId('kit-input-password');

        expect(input).toBeDisabled();
    });
});
