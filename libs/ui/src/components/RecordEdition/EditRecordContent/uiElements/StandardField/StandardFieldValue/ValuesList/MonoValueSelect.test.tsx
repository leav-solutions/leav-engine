// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {expectToThrow, render, screen} from '_ui/_tests/testUtils';
import {MonoValueSelect} from './MonoValueSelect';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockAttributeSimple, mockAttributeWithDetails} from '_ui/__mocks__/common/attribute';
import * as gqlTypes from '_ui/_gqlTypes';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {mockRecord} from '_ui/__mocks__/common/record';
import {AntForm} from 'aristid-ds';
import userEvent from '@testing-library/user-event';
import {VersionFieldScope} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {IStandardFieldReducerState} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';
import {
    EditRecordReducerActionsTypes,
    IEditRecordReducerState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';

describe('<MonoValueSelect />', () => {
    const handleSubmitMock = jest.fn();

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

    const valuesList = {
        enable: true,
        values: ['green', 'yellow', 'foudre']
    };

    const state = {
        record: mockRecord,
        formElement: {
            ...mockFormElementInput,
            settings: {
                label: {en: 'label'},
                required: false
            }
        },
        attribute: {
            ...mockAttributeSimple,
            readonly: false,
            multiple_values: false,
            permissions: {access_attribute: true, edit_value: true},
            values_list: valuesList
        },
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

    afterEach(() => {
        handleSubmitMock.mockClear();
    });

    describe('errors', () => {
        it('should throw an error when displayed not inside an Ant Form', async () => {
            expectToThrow(
                () =>
                    render(
                        <MonoValueSelect
                            data-testid="test"
                            presentationValue=""
                            state={state}
                            handleSubmit={handleSubmitMock}
                        />
                    ),
                'MonoValueSelect should be used inside a antd Form.Item'
            );
        });

        it('should throw an error when displayed without values_list in attribute', async () => {
            const attributeWithoutValuesList = {...state.attribute};
            delete attributeWithoutValuesList.values_list;

            expectToThrow(
                () =>
                    render(
                        <AntForm name="name">
                            <AntForm.Item name="chartreuse">
                                <MonoValueSelect
                                    data-testid="test"
                                    presentationValue=""
                                    state={{...state, attribute: attributeWithoutValuesList}}
                                    handleSubmit={handleSubmitMock}
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
                        data-testid="test"
                        presentationValue="green"
                        state={state}
                        handleSubmit={handleSubmitMock}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const select = screen.getByRole('combobox');
        await userEvent.click(select);

        const green = screen.getAllByText('green').pop();
        await userEvent.click(green);

        expect(handleSubmitMock).toHaveBeenCalledTimes(1);
        expect(handleSubmitMock).toHaveBeenCalledWith('green', state.attribute.id);

        const clearIcon = screen.getByLabelText('clear');
        await userEvent.click(clearIcon);

        expect(handleSubmitMock).toHaveBeenCalledTimes(2);
        expect(handleSubmitMock).toHaveBeenCalledWith('', state.attribute.id);
    });

    describe('search with result', () => {
        it('should display a specific text on search with results', async () => {
            render(
                <AntForm name="name">
                    <AntForm.Item name="chartreuse">
                        <MonoValueSelect
                            data-testid="test"
                            presentationValue=""
                            state={state}
                            handleSubmit={handleSubmitMock}
                        />
                    </AntForm.Item>
                </AntForm>
            );

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            await userEvent.type(select, 'r');

            await new Promise(resolve => setTimeout(resolve, 3_000));

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
                        <MonoValueSelect data-testid="test" state={state} handleSubmit={handleSubmitMock} />
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
                            data-testid="test"
                            state={{
                                ...state,
                                attribute: {
                                    ...state.attribute,
                                    values_list: {...valuesList, allowFreeEntry: true}
                                }
                            }}
                            handleSubmit={handleSubmitMock}
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

            expect(handleSubmitMock).toHaveBeenCalledWith(newColor, state.attribute.id);
            expect(screen.getByTestId('test').innerHTML).toMatch(new RegExp(newColor));
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
                        <MonoValueSelect
                            data-testid="test"
                            state={{
                                ...state,
                                attribute: {
                                    ...state.attribute,
                                    values_list: {...valuesList, allowFreeEntry: true, allowListUpdate: true}
                                }
                            }}
                            handleSubmit={handleSubmitMock}
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

            expect(handleSubmitMock).toHaveBeenCalledWith(newColor, state.attribute.id);
            expect(mockEditRecordDispatch).toHaveBeenCalledWith({type: EditRecordReducerActionsTypes.REQUEST_REFRESH});
            expect(screen.getByTestId('test').innerHTML).toMatch(new RegExp(newColor));
        });
    });
});
