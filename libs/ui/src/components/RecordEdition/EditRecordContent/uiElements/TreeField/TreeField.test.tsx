// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import * as useRefreshFieldValues from '_ui/hooks/useRefreshFieldValues/useRefreshFieldValues';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {act, ICustomRenderOptions, render, screen, waitFor, within} from '_ui/_tests/testUtils';
import {mockAttributeTree} from '_ui/__mocks__/common/attribute';
import {mockFormElementTree, mockTreeValueA} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeRecord} from '_ui/__mocks__/common/treeElements';
import TreeField from '.';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    IFormElementProps,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';

jest.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>
}));

// To skip ellipsis in RecordCard, which is not very predictable during tests (sometimes only render "...")
jest.mock('antd/lib/typography/Paragraph', () => function Paragraph({children}) {
        return <div>{children}</div>;
    });

describe('TreeField', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordDispatch
    }));

    jest.spyOn(useRefreshFieldValues, 'default').mockImplementation(() => ({
        fetchValues: jest.fn().mockResolvedValue([])
    }));

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                ...(mockTreeValueA as RecordFormElementsValueTreeValue),
                id_value: '987655',
                version: null,
                attribute: {...mockAttributeTree, system: false},
                metadata: null
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn(async () => mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});

    const mockHandleDeleteMultipleValues: DeleteMultipleValuesFunc = jest
        .fn()
        .mockReturnValue({status: APICallStatus.SUCCESS});

    const baseProps = {
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleDeleteMultipleValues
    };

    const _renderTreeField = (
        props: Partial<IFormElementProps<ICommonFieldsSettings>>,
        renderOptions?: ICustomRenderOptions
    ) => {
        const allProps = {
            ...baseProps,
            ...(props as IFormElementProps<ICommonFieldsSettings>)
        };

        return render(
            <RecordEditionContext.Provider
                value={{
                    record: mockRecord,
                    readOnly: false,
                    elements: null
                }}
            >
                <TreeField {...allProps} />
            </RecordEditionContext.Provider>,
            renderOptions
        );
    };

    beforeEach(() => jest.clearAllMocks());

    test('If no values, display "add values" button', async () => {
        _renderTreeField({
            element: {...mockFormElementTree, values: []}
        });

        expect(screen.getByRole('button', {name: /add/})).toBeInTheDocument();
    });

    test('If multiple values, can add a new value', async () => {
        _renderTreeField({
            element: {
                ...mockFormElementTree,
                attribute: {...mockFormElementTree.attribute, multiple_values: true}
            }
        });

        const addValueBtn = screen.getByRole('button', {name: /add/});
        expect(addValueBtn).toBeInTheDocument();

        userEvent.click(addValueBtn);

        await waitFor(() => {
            expect(screen.getByText('SelectTreeNode')).toBeInTheDocument();
        });
    });

    test('If readonly attribute, cannot add a new value', async () => {
        _renderTreeField({
            element: {
                ...mockFormElementTree,
                attribute: {...mockFormElementTree.attribute, multiple_values: true, readonly: true}
            }
        });

        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
    });

    test('If not multiple values, cannot add a new value', async () => {
        _renderTreeField({
            element: {
                ...mockFormElementTree,
                attribute: {...mockFormElementTree.attribute, multiple_values: false}
            }
        });

        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
    });

    test('Can delete existing value', async () => {
        _renderTreeField({
            element: mockFormElementTree
        });

        expect(screen.getAllByRole('button', {name: /delete-value/, hidden: true})).toHaveLength(2);
    });

    test('Can delete all values', async () => {
        _renderTreeField({
            element: mockFormElementTree
        });

        const deleteAllButton = screen.getByRole('button', {name: /delete-all-values/, hidden: true});
        expect(deleteAllButton).toBeInTheDocument();

        // Click on the parent, because of the issue on Tooltip. See DeleteAllValuesBtn component file
        await userEvent.click(deleteAllButton.parentElement);

        await userEvent.click(screen.getByRole('button', {name: /confirm/}));

        expect(baseProps.onDeleteMultipleValues).toBeCalled();
    });

    test('Can edit linked node', async () => {
        _renderTreeField({
            element: mockFormElementTree
        });

        expect(screen.getAllByRole('button', {name: 'edit-record', hidden: true})).toHaveLength(2);
    });

    test('Can display value details', async () => {
        _renderTreeField({
            element: mockFormElementTree
        });

        const valueDetailsButtons = screen.getAllByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButtons).toHaveLength(3); // 1 per value + 1 for the attribute

        await userEvent.click(valueDetailsButtons[0]);

        expect(mockEditRecordDispatch).toBeCalled();
        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    test('Can select value from values list', async () => {
        const mockRecordFromList = {
            ...mockTreeRecord,
            whoAmI: {...mockTreeRecord.whoAmI, label: 'Record from value'}
        };
        const mockAttribute: RecordFormAttributeTreeAttributeFragment = {
            ...mockFormElementTree.attribute,
            linked_tree: {
                id: 'some_tree',
                label: {fr: 'Mon arbre'}
            },
            treeValuesList: {
                enable: true,
                allowFreeEntry: true,
                values: [
                    {
                        id: '123456',
                        record: mockRecordFromList,
                        ancestors: [{record: mockRecordFromList}]
                    }
                ]
            },
            multiple_values: true
        };

        _renderTreeField({
            element: {...mockFormElementTree, attribute: mockAttribute}
        });

        const addValueBtn = screen.getByRole('button', {name: /add/});

        await userEvent.click(addValueBtn);

        const valuesAddBlock = within(screen.getByTestId('values-add'));

        const elementInList = valuesAddBlock.getByText(mockRecordFromList.whoAmI.label);
        expect(elementInList).toBeInTheDocument();

        await userEvent.click(elementInList);

        expect(mockHandleSubmit).toBeCalled();
    });
});
