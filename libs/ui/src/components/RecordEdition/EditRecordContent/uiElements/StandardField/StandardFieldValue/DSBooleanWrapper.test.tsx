// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {AntForm} from 'aristid-ds';
import {DSBooleanWrapper} from './DSBooleanWrapper';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import userEvent from '@testing-library/user-event';
import {CalculatedFlags, InheritedFlags} from '../calculatedInheritedFlags';

const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
    isCalculatedValue: false,
    isCalculatedOverrideValue: false,
    isCalculatedNotOverrideValue: false,
    calculatedValue: null
};

const calculatedFlagsWithCalculatedValue: CalculatedFlags = {
    isCalculatedValue: true,
    isCalculatedOverrideValue: true,
    isCalculatedNotOverrideValue: false,
    calculatedValue: {
        raw_payload: true
    }
};

const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
    isInheritedValue: false,
    isInheritedOverrideValue: false,
    isInheritedNotOverrideValue: false,
    inheritedValue: null
};

const inheritedFagsWithInheritedValue: InheritedFlags = {
    isInheritedValue: true,
    isInheritedOverrideValue: true,
    isInheritedNotOverrideValue: false,
    inheritedValue: {
        raw_payload: true
    }
};

const notRequired = false;
const notReadonly = false;
const readonly = true;

describe('DSBooleanWrapper', () => {
    let user!: ReturnType<typeof userEvent.setup>;
    const mockHandleSubmit = jest.fn();
    const mockOnChange = jest.fn();

    beforeEach(() => {
        user = userEvent.setup({});
        mockHandleSubmit.mockReset();
        mockOnChange.mockReset();
    });

    test('Should display boolean value as yes', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={true}
                        attribute={mockFormAttribute}
                        readonly={notRequired}
                        required={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(/yes/)).toBeVisible();
    });

    test('Should display boolean value as no', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        required={notRequired}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        expect(screen.getByText(/no/)).toBeVisible();
    });

    test('Should be disabled if readonly', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        attribute={mockFormAttribute}
                        readonly={readonly}
                        required={notRequired}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const switchInput = screen.getByRole('switch');
        expect(switchInput).toBeDisabled();
    });

    test('Should submit true if the switch was set to false', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        required={notRequired}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFagsWithInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const switchInput = screen.getByRole('switch');
        await user.click(switchInput);

        expect(mockHandleSubmit).toHaveBeenCalledWith('true', mockFormAttribute.id);
    });

    test('Should submit false if the switch was set to true', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={true}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        required={notRequired}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        handleSubmit={mockHandleSubmit}
                        onChange={mockOnChange}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const switchInput = screen.getByRole('switch');
        await user.click(switchInput);

        expect(mockHandleSubmit).toHaveBeenCalledWith('false', mockFormAttribute.id);
    });

    test('Should allow to clear inherited override value', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        required={notRequired}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFagsWithInheritedValue}
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

    test('Should allow to clear calculated override value', async () => {
        render(
            <AntForm>
                <AntForm.Item>
                    <DSBooleanWrapper
                        value={false}
                        attribute={mockFormAttribute}
                        readonly={notReadonly}
                        required={notRequired}
                        calculatedFlags={calculatedFlagsWithCalculatedValue}
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
});
