// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {expectToThrow, render, screen} from '_ui/_tests/testUtils';
import {DSListSelect} from './DSListSelect';
import {mockAttributeSimple, mockAttributeWithDetails} from '_ui/__mocks__/common/attribute';
import * as gqlTypes from '_ui/_gqlTypes';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {AntForm} from 'aristid-ds';
import userEvent from '@testing-library/user-event';
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {
    EditRecordReducerActionsTypes,
    IEditRecordReducerState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {CalculatedFlags, InheritedFlags} from '../../calculatedInheritedFlags';

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

describe('<DSListSelect />', () => {
    const handleSubmitMock = jest.fn();
    const mockSetActiveValue = jest.fn();

    const mockSaveAttributeMutation = jest.fn().mockReturnValue({
        data: {
            saveAttribute: {
                ...mockAttributeWithDetails
            }
        }
    });
    jest.spyOn(gqlTypes, 'useSaveAttributeMutation').mockImplementation(() => [
        mockSaveAttributeMutation,
        {loading: false, called: false, client: null, reset: null, error: null}
    ]);

    const commonAttribute: RecordFormAttributeStandardAttributeFragment = {
        ...mockAttributeSimple,
        readonly: false,
        required: false,
        multiple_values: false,
        permissions: {access_attribute: true, edit_value: true},
        compute: false
    };

    const valuesList = {
        enable: true,
        values: ['green', 'yellow', 'foudre']
    };

    const attribute = {
        ...commonAttribute,
        values_list: valuesList
    } satisfies RecordFormAttributeStandardAttributeFragment;

    afterEach(() => {
        handleSubmitMock.mockClear();
        mockSetActiveValue.mockClear();
    });

    describe('errors', () => {
        it('should throw an error when displayed not inside an Ant Form', async () => {
            expectToThrow(
                () =>
                    render(
                        <DSListSelect
                            attribute={commonAttribute}
                            presentationValue=""
                            handleSubmit={handleSubmitMock}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            setActiveValue={mockSetActiveValue}
                        />
                    ),
                'DSListSelect should be used inside a antd Form.Item'
            );
        });

        it('should throw an error when displayed without values_list in attribute', async () => {
            expectToThrow(
                () =>
                    render(
                        <AntForm name="name">
                            <AntForm.Item name="chartreuse">
                                <DSListSelect
                                    attribute={commonAttribute}
                                    presentationValue=""
                                    handleSubmit={handleSubmitMock}
                                    readonly={notReadonly}
                                    calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                                    inheritedFlags={inheritedFlagsWithoutInheritedValue}
                                    setActiveValue={mockSetActiveValue}
                                />
                            </AntForm.Item>
                        </AntForm>
                    ),
                'DSListSelect should have a values list'
            );
        });
    });

    test('Should be disabled when readonly', async () => {
        render(
            <AntForm name="name">
                <AntForm.Item name="chartreuse">
                    <DSListSelect
                        attribute={attribute}
                        presentationValue="green"
                        handleSubmit={handleSubmitMock}
                        readonly={readonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const select = screen.getByRole('combobox');
        expect(select).toBeDisabled();
    });

    it('should call handleSubmit on clear', async () => {
        render(
            <AntForm name="name">
                <AntForm.Item name="chartreuse">
                    <DSListSelect
                        attribute={attribute}
                        presentationValue="green"
                        handleSubmit={handleSubmitMock}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const select = screen.getByRole('combobox');
        await userEvent.click(select);

        const green = screen.getAllByText('green').pop();
        await userEvent.click(green);

        expect(handleSubmitMock).toHaveBeenCalledTimes(1);
        expect(handleSubmitMock).toHaveBeenCalledWith('green', attribute.id);

        const clearIcon = screen.getByLabelText('clear');
        await userEvent.click(clearIcon);

        expect(handleSubmitMock).toHaveBeenCalledTimes(2);
        expect(handleSubmitMock).toHaveBeenCalledWith('', attribute.id);
    });

    it('should call setActiveValue if focused', async () => {
        render(
            <AntForm name="name">
                <AntForm.Item name="chartreuse">
                    <DSListSelect
                        attribute={attribute}
                        presentationValue="green"
                        handleSubmit={handleSubmitMock}
                        readonly={notReadonly}
                        calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                        inheritedFlags={inheritedFlagsWithoutInheritedValue}
                        setActiveValue={mockSetActiveValue}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const select = screen.getByRole('combobox');
        await userEvent.click(select);

        expect(mockSetActiveValue).toHaveBeenCalled();
    });

    describe('search with result', () => {
        it('should display a specific text on search with results', async () => {
            render(
                <AntForm name="name">
                    <AntForm.Item name="chartreuse">
                        <DSListSelect
                            attribute={attribute}
                            presentationValue=""
                            handleSubmit={handleSubmitMock}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            setActiveValue={mockSetActiveValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            await userEvent.type(select, 'r');

            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

            expect(screen.getByText('record_edition.press_enter_to')).toBeVisible();
            expect(screen.getByText('record_edition.select_this_value')).toBeVisible();
        });
    });

    describe('search without result', () => {
        const newColor = 'une couleur';
        it('should display a notfound text without free entry', async () => {
            render(
                <AntForm name="name">
                    <AntForm.Item name="chartreuse">
                        <DSListSelect
                            attribute={attribute}
                            handleSubmit={handleSubmitMock}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            setActiveValue={mockSetActiveValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            await userEvent.type(select, newColor);

            expect(screen.queryByTitle(newColor)).not.toBeInTheDocument();
            expect(screen.getByText('record_edition.search_not_found')).toBeVisible();
        });

        it('should display the option with free entry', async () => {
            render(
                <AntForm name="name">
                    <AntForm.Item name="chartreuse">
                        <DSListSelect
                            attribute={{...attribute, values_list: {...valuesList, allowFreeEntry: true}}}
                            handleSubmit={handleSubmitMock}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            setActiveValue={mockSetActiveValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            await userEvent.type(select, newColor);

            expect(screen.queryByText('record_edition.search_not_found')).not.toBeInTheDocument();
            const newColorOption = screen.getByText(`record_edition.select_option${newColor}`);
            await userEvent.click(newColorOption);

            expect(handleSubmitMock).toHaveBeenCalledWith(newColor, attribute.id);
            expect(screen.getByTestId(attribute.id).innerHTML).toMatch(new RegExp(newColor));
        });

        it('should display the option and create it with list update', async () => {
            const mockEditRecordDispatch = jest.fn();
            const editRecordState = {};
            jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
                state: editRecordState as IEditRecordReducerState,
                dispatch: mockEditRecordDispatch
            }));

            render(
                <AntForm name="name">
                    <AntForm.Item name="chartreuse">
                        <DSListSelect
                            attribute={{
                                ...attribute,
                                values_list: {...valuesList, allowFreeEntry: true, allowListUpdate: true}
                            }}
                            handleSubmit={handleSubmitMock}
                            readonly={notReadonly}
                            calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                            inheritedFlags={inheritedFlagsWithoutInheritedValue}
                            setActiveValue={mockSetActiveValue}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            await userEvent.type(select, newColor);

            expect(screen.queryByText('record_edition.search_not_found')).not.toBeInTheDocument();
            const newColorOption = screen.getByText(`record_edition.create_and_select_option${newColor}`);
            await userEvent.click(newColorOption);

            expect(handleSubmitMock).toHaveBeenCalledWith(newColor, attribute.id);
            expect(mockEditRecordDispatch).toHaveBeenCalledWith({type: EditRecordReducerActionsTypes.REQUEST_REFRESH});
            expect(screen.getByTestId(attribute.id).innerHTML).toMatch(new RegExp(newColor));
        });

        describe('multiple', () => {
            it('should remove selected options from list', async () => {
                render(
                    <AntForm name="name" initialValues={{[attribute.id]: valuesList.values}}>
                        <AntForm.Item name={attribute.id}>
                            <DSListSelect
                                attribute={{
                                    ...attribute,
                                    values_list: {...valuesList, allowFreeEntry: true, allowListUpdate: true},
                                    multiple_values: true
                                }}
                                handleSubmit={handleSubmitMock}
                                readonly={notReadonly}
                                calculatedFlags={calculatedFlagsWithoutCalculatedValue}
                                inheritedFlags={inheritedFlagsWithoutInheritedValue}
                                setActiveValue={mockSetActiveValue}
                            />
                        </AntForm.Item>
                    </AntForm>
                );

                const select = screen.getByRole('combobox');
                await userEvent.click(select);

                expect(screen.getByText('record_edition.search_not_found')).toBeVisible();
            });
        });
    });
});
