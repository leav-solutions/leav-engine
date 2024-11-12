// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {expectToThrow, render, screen} from '_ui/_tests/testUtils';
import {MonoValueSelect} from './MonoValueSelect';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockAttributeSimple, mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import {AntForm} from 'aristid-ds';
import userEvent from '@testing-library/user-event';
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {VersionFieldScope} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {
    CalculatedFlags,
    InheritedFlags,
    IStandardFieldReducerState,
    IStandardFieldValue
} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';

describe('<MonoValueSelect />', () => {
    const handleSubmitMock = jest.fn();
    const handleBlurMock = jest.fn();

    const commonAttribute: RecordFormAttributeStandardAttributeFragment = {
        ...mockAttributeSimple,
        readonly: false,
        multiple_values: false,
        permissions: {access_attribute: true, edit_value: true}
    };

    const valuesList = {
        enable: true,
        values: ['green', 'yellow', 'foudre']
    };

    const attribute = {
        ...commonAttribute,
        values_list: valuesList
    } satisfies RecordFormAttributeStandardAttributeFragment;

    const state = {
        record: mockRecord,
        formElement: {
            ...mockFormElementInput,
            settings: {
                label: {en: 'label'},
                required: false
            }
        },
        attribute: mockFormAttribute,
        isReadOnly: false,
        activeScope: VersionFieldScope.CURRENT,
        values: {
            [VersionFieldScope.CURRENT]: null,
            [VersionFieldScope.INHERITED]: null
        },
        metadataEdit: false,
        inheritedValue: null,
        isInheritedValue: false,
        isInheritedNotOverrideValue: false,
        isInheritedOverrideValue: false,
        calculatedValue: null,
        isCalculatedNotOverrideValue: false,
        isCalculatedOverrideValue: false,
        isCalculatedValue: false
    } satisfies IStandardFieldReducerState;

    const fieldValue: IStandardFieldValue = {
        idValue: '12',
        index: 12,
        value: null,
        displayValue: '12',
        editingValue: '12',
        originRawValue: '12',
        isEditing: false,
        isErrorDisplayed: false,
        state: null
    };

    afterEach(() => {
        handleSubmitMock.mockClear();
        handleBlurMock.mockClear();
    });

    describe('errors', () => {
        it('should throw an error when displayed not inside an Ant Form', async () => {
            expectToThrow(
                () =>
                    render(
                        <MonoValueSelect
                            attribute={commonAttribute}
                            state={state}
                            fieldValue={fieldValue}
                            handleSubmit={handleSubmitMock}
                            handleBlur={handleBlurMock}
                        />
                    ),
                'MonoValueSelect should be used inside a antd Form.Item'
            );
        });

        it('should throw an error when displayed without values_list in attribute', async () => {
            expectToThrow(
                () =>
                    render(
                        <AntForm name="name">
                            <AntForm.Item name="chartreuse">
                                <MonoValueSelect
                                    attribute={commonAttribute}
                                    state={state}
                                    fieldValue={fieldValue}
                                    handleSubmit={handleSubmitMock}
                                    handleBlur={handleBlurMock}
                                />
                            </AntForm.Item>
                        </AntForm>
                    ),
                'MonoValueSelect should have a values list'
            );
        });
    });

    it('should call handleSubmit on clear', async () => {
        render(
            <AntForm name="name">
                <AntForm.Item name="chartreuse">
                    <MonoValueSelect
                        attribute={attribute}
                        state={state}
                        fieldValue={{...fieldValue, isEditing: true}}
                        handleSubmit={handleSubmitMock}
                        handleBlur={handleBlurMock}
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

    describe('calulated & inherited values', () => {
        it.each`
            calculatedValue | inheritedValue | displayedValue
            ${'calculated'} | ${null}        | ${'calculated'}
            ${null}         | ${'inherited'} | ${'inherited'}
            ${'calculated'} | ${'inherited'} | ${'inherited'}
        `(
            'should display calculated / inherited value in helper',
            ({
                calculatedValue,
                inheritedValue,
                displayedValue
            }: {
                calculatedValue: string | null;
                inheritedValue: string | null;
                displayedValue: string;
            }) => {
                const stateWithInheritedValue: InheritedFlags = {
                    inheritedValue: {raw_value: inheritedValue},
                    isInheritedValue: true,
                    isInheritedNotOverrideValue: false,
                    isInheritedOverrideValue: true
                };
                const stateWithCalculatedValue: CalculatedFlags = {
                    calculatedValue: {raw_value: calculatedValue},
                    isCalculatedValue: true,
                    isCalculatedNotOverrideValue: false,
                    isCalculatedOverrideValue: true
                };

                let newState = state;
                if (inheritedValue) {
                    newState = {...newState, ...stateWithInheritedValue} as any;
                }

                if (calculatedValue) {
                    newState = {...newState, ...stateWithCalculatedValue} as any;
                }

                render(
                    <AntForm name="name">
                        <AntForm.Item name="chartreuse">
                            <MonoValueSelect
                                attribute={attribute}
                                state={newState}
                                fieldValue={{...fieldValue, isEditing: true}}
                                handleSubmit={handleSubmitMock}
                                handleBlur={handleBlurMock}
                            />
                        </AntForm.Item>
                    </AntForm>
                );

                expect(screen.getByText(new RegExp(`${displayedValue}`))).toBeVisible();
            }
        );

        it.each`
            calculatedValue | inheritedValue | displayedValue
            ${'calculated'} | ${null}        | ${'calculated'}
            ${null}         | ${'inherited'} | ${'inherited'}
            ${'calculated'} | ${'inherited'} | ${'inherited'}
        `(
            'should revert to calculated / inherited value on click on clear icon',
            async ({
                calculatedValue,
                inheritedValue,
                displayedValue
            }: {
                calculatedValue: string | null;
                inheritedValue: string | null;
                displayedValue: string;
            }) => {
                const stateWithInheritedValue: InheritedFlags = {
                    inheritedValue: {raw_value: inheritedValue},
                    isInheritedValue: true,
                    isInheritedNotOverrideValue: true,
                    isInheritedOverrideValue: false
                };
                const stateWithCalculatedValue: CalculatedFlags = {
                    calculatedValue: {raw_value: calculatedValue},
                    isCalculatedValue: true,
                    isCalculatedNotOverrideValue: true,
                    isCalculatedOverrideValue: false
                };

                let newState = state;
                if (inheritedValue) {
                    newState = {...newState, ...stateWithInheritedValue} as any;
                }

                if (calculatedValue) {
                    newState = {...newState, ...stateWithCalculatedValue} as any;
                }

                render(
                    <AntForm name="name">
                        <AntForm.Item name="chartreuse">
                            <MonoValueSelect
                                attribute={attribute}
                                state={newState}
                                fieldValue={{...fieldValue, isEditing: true}}
                                handleSubmit={handleSubmitMock}
                                handleBlur={handleBlurMock}
                            />
                        </AntForm.Item>
                    </AntForm>
                );

                expect(screen.getByTestId(attribute.id).innerHTML).not.toMatch(new RegExp(displayedValue));
                const select = screen.getByRole('combobox');
                await userEvent.click(select);

                const green = screen.getAllByText('green').pop();
                await userEvent.click(green);

                const clearIcon = screen.getByLabelText('clear');
                await userEvent.click(clearIcon);

                expect(screen.getByTestId(attribute.id).innerHTML).toMatch(new RegExp(displayedValue));
            }
        );
    });

    describe('search with result', () => {
        it('should display a specific text on search with results', async () => {
            render(
                <AntForm name="name">
                    <AntForm.Item name="chartreuse">
                        <MonoValueSelect
                            attribute={attribute}
                            state={state}
                            fieldValue={{...fieldValue, isEditing: true}}
                            handleSubmit={handleSubmitMock}
                            handleBlur={handleBlurMock}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            await userEvent.type(select, 'r');

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
                        <MonoValueSelect
                            attribute={attribute}
                            state={state}
                            fieldValue={{...fieldValue, isEditing: true}}
                            handleSubmit={handleSubmitMock}
                            handleBlur={handleBlurMock}
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
                        <MonoValueSelect
                            attribute={{...attribute, values_list: {...valuesList, allowFreeEntry: true}}}
                            state={state}
                            fieldValue={{...fieldValue, isEditing: true}}
                            handleSubmit={handleSubmitMock}
                            handleBlur={handleBlurMock}
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

            expect(screen.getByTestId(attribute.id).innerHTML).toMatch(new RegExp(newColor));
        });
    });
});
