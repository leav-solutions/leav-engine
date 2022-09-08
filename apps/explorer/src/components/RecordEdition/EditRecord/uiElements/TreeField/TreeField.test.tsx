// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import React from 'react';
import {
    RECORD_FORM_recordForm_elements_attribute_TreeAttribute,
    RECORD_FORM_recordForm_elements_values_TreeValue
} from '_gqlTypes/RECORD_FORM';
import {act, render, screen, waitFor, within} from '_tests/testUtils';
import {mockAttributeTree} from '__mocks__/common/attribute';
import {mockFormElementTree, mockTreeValueA} from '__mocks__/common/form';
import {mockTreeRecord} from '__mocks__/common/treeElements';
import TreeField from '.';
import {APICallStatus, DeleteValueFunc, ISubmitMultipleResult, SubmitValueFunc} from '../../_types';

jest.mock('../../../../shared/SelectTreeNode', () => {
    return function SelectTreeNode() {
        return <div>SelectTreeNode</div>;
    };
});

// To skip ellipsis in RecordCard, which is not very predictable during tests (sometimes only render "...")
jest.mock('antd/lib/typography/Paragraph', () => {
    return function Paragraph({children}) {
        return <div>{children}</div>;
    };
});

describe('TreeField', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordDispatch
    }));

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                ...(mockTreeValueA as RECORD_FORM_recordForm_elements_values_TreeValue),
                id_value: '987654',
                version: null,
                attribute: {...mockAttributeTree, system: false},
                metadata: null
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn(async () => {
        return mockSubmitRes;
    });
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});

    beforeEach(() => jest.clearAllMocks());

    test('If no values, display "add values" button', async () => {
        render(
            <TreeField
                element={{...mockFormElementTree, values: []}}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        expect(screen.getByRole('button', {name: /add/})).toBeInTheDocument();
    });

    test('If multiple values, can add a new value', async () => {
        await act(async () => {
            render(
                <TreeField
                    element={{
                        ...mockFormElementTree,
                        attribute: {...mockFormElementTree.attribute, multiple_values: true}
                    }}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const addValueBtn = screen.getByRole('button', {name: /add/});
        expect(addValueBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(addValueBtn);
        });

        expect(screen.getByText('SelectTreeNode')).toBeInTheDocument();
    });

    test('If readonly attribute, cannot add a new value', async () => {
        await act(async () => {
            render(
                <TreeField
                    element={{
                        ...mockFormElementTree,
                        attribute: {...mockFormElementTree.attribute, multiple_values: true, readonly: true}
                    }}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
    });

    test('If not multiple values, cannot add a new value', async () => {
        await act(async () => {
            render(
                <TreeField
                    element={{
                        ...mockFormElementTree,
                        attribute: {...mockFormElementTree.attribute, multiple_values: false}
                    }}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
    });

    test('Can delete existing value', async () => {
        await act(async () => {
            render(
                <TreeField
                    element={mockFormElementTree}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getAllByRole('button', {name: /delete/, hidden: true})).toHaveLength(2);
    });

    test('Can edit linked node', async () => {
        await act(async () => {
            render(
                <TreeField
                    element={mockFormElementTree}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getAllByRole('button', {name: 'edit-record', hidden: true})).toHaveLength(2);
    });

    test('Can display value details', async () => {
        await act(async () => {
            render(
                <TreeField
                    element={mockFormElementTree}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const valueDetailsButtons = screen.getAllByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButtons).toHaveLength(2);

        userEvent.click(valueDetailsButtons[0]);

        expect(mockEditRecordDispatch).toBeCalled();
        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    test('Can select value from values list', async () => {
        const mockRecordFromList = {
            ...mockTreeRecord,
            whoAmI: {...mockTreeRecord.whoAmI, label: 'Record from value'}
        };
        const mockAttribute: RECORD_FORM_recordForm_elements_attribute_TreeAttribute = {
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

        await act(async () => {
            render(
                <TreeField
                    element={{
                        ...mockFormElementTree,
                        attribute: {...mockAttribute}
                    }}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const addValueBtn = screen.getByRole('button', {name: /add/});

        await act(async () => {
            userEvent.click(addValueBtn);
        });

        const valuesAddBlock = within(screen.getByTestId('values-add'));

        const elementInList = await waitFor(() => valuesAddBlock.getByText(mockRecordFromList.whoAmI.label));
        expect(elementInList).toBeInTheDocument();

        await act(async () => {
            userEvent.click(elementInList);
        });
        expect(mockHandleSubmit).toBeCalled();
    });
});
