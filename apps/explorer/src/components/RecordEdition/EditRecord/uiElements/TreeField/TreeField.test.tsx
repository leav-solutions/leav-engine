// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute_TreeAttribute} from '_gqlTypes/GET_FORM';
import {act, render, screen, waitForElement, within} from '_tests/testUtils';
import {mockAttributeTree} from '__mocks__/common/attribute';
import {mockFormElementTree} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockTreeRecord} from '__mocks__/common/treeElements';
import {mockModifier} from '__mocks__/common/value';
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
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordDispatch
    }));

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const mockRecord = {
        id: '123456',
        whoAmI: {
            ...mockRecordWhoAmI,
            id: '123456',
            label: 'Record label A',
            library: {
                ...mockRecordWhoAmI.library,
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const mockRecord2 = {
        id: '123458',
        whoAmI: {
            ...mockRecordWhoAmI,
            id: '123458',
            label: 'Record label B',
            library: {
                ...mockRecordWhoAmI.library,
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const mockRecordAncestor = {
        id: '123457',
        whoAmI: {
            ...mockRecordWhoAmI,
            id: '123457',
            label: 'Record label ancestor',
            library: {
                ...mockRecordWhoAmI.library,
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const mockRecordAncestor2 = {
        id: '223457',
        whoAmI: {
            ...mockRecordWhoAmI,
            id: '223457',
            label: 'Record label other ancestor',
            library: {
                ...mockRecordWhoAmI.library,
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const valueA: IRecordPropertyTree = {
        treeValue: {
            record: mockRecord,
            ancestors: [
                [
                    {
                        record: mockRecordAncestor
                    },
                    {
                        record: mockRecord
                    }
                ]
            ]
        },
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: '123456'
    };

    const valueB: IRecordPropertyTree = {
        ...valueA,
        treeValue: {
            record: mockRecord2,
            ancestors: [
                [
                    {
                        record: mockRecordAncestor
                    },
                    {
                        record: mockRecord2
                    }
                ]
            ]
        },
        id_value: '987654'
    };

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                ...valueA,
                id_value: '987654',
                version: null,
                attribute: {...mockAttributeTree, system: false}
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});

    const recordValues = {
        test: [valueA, valueB]
    };

    beforeEach(() => jest.clearAllMocks());

    test('If no values, display "add values" button', async () => {
        render(
            <TreeField
                recordValues={{test: []}}
                element={mockFormElementTree}
                record={mockRecordWhoAmI}
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
                    recordValues={recordValues}
                    element={{
                        ...mockFormElementTree,
                        attribute: {...mockFormElementTree.attribute, multiple_values: true}
                    }}
                    record={mockRecordWhoAmI}
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

    test('If not multiple values, cannot add a new value', async () => {
        render(
            <TreeField
                recordValues={recordValues}
                element={{
                    ...mockFormElementTree,
                    attribute: {...mockFormElementTree.attribute, multiple_values: false}
                }}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
    });

    test('Can delete existing value', async () => {
        render(
            <TreeField
                recordValues={recordValues}
                element={mockFormElementTree}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        expect(screen.getAllByRole('button', {name: /delete/, hidden: true})).toHaveLength(2);
    });

    test('Can edit linked node', async () => {
        render(
            <TreeField
                recordValues={recordValues}
                element={mockFormElementTree}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        expect(screen.getAllByRole('button', {name: 'edit-record', hidden: true})).toHaveLength(2);
    });

    test('Can display value details', async () => {
        render(
            <TreeField
                recordValues={recordValues}
                element={mockFormElementTree}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const valueDetailsButtons = screen.getAllByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButtons).toHaveLength(2);

        userEvent.click(valueDetailsButtons[0]);

        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    test('Can select value from values list', async () => {
        const mockRecordFromList = {
            ...mockTreeRecord,
            whoAmI: {...mockTreeRecord.whoAmI, label: 'Record from value'}
        };
        const mockAttribute: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute = {
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
                        record: mockRecordFromList,
                        ancestors: [[{record: mockRecordFromList}]]
                    }
                ]
            },
            multiple_values: true
        };

        await act(async () => {
            render(
                <TreeField
                    recordValues={recordValues}
                    element={{
                        ...mockFormElementTree,
                        attribute: {...mockAttribute}
                    }}
                    record={mockRecordWhoAmI}
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

        const elementInList = await waitForElement(() => valuesAddBlock.getByText(mockRecordFromList.whoAmI.label));
        expect(elementInList).toBeInTheDocument();

        await act(async () => {
            userEvent.click(elementInList);
        });
        expect(mockHandleSubmit).toBeCalled();
    });
});
