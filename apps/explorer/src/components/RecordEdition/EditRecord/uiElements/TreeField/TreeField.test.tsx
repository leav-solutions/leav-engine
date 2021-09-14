// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {IRecordPropertyTree} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute_TreeAttribute} from '_gqlTypes/GET_FORM';
import {act, render, screen, waitForElement, within} from '_tests/testUtils';
import {mockFormElementTree} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockTreeRecord} from '__mocks__/common/treeElements';
import {mockModifier} from '__mocks__/common/value';
import TreeField from '.';
import * as useSaveValueBatchMutation from '../../hooks/useSaveValueBatchMutation';
import {APICallStatus} from '../../_types';

jest.mock('../../shared/ValueDetails', () => {
    return function ValueDetails() {
        return <div>ValueDetails</div>;
    };
});

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

    const mockRecord = {
        id: '123456',
        whoAmI: {
            id: '123456',
            label: 'Record label A',
            library: {
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const mockRecord2 = {
        id: '123458',
        whoAmI: {
            id: '123458',
            label: 'Record label B',
            library: {
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const mockRecordAncestor = {
        id: '123457',
        whoAmI: {
            id: '123457',
            label: 'Record label ancestor',
            library: {
                id: 'linked_lib',
                label: {en: 'Linked lib'}
            }
        }
    };

    const mockRecordAncestor2 = {
        id: '223457',
        whoAmI: {
            id: '223457',
            label: 'Record label other ancestor',
            library: {
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

    const recordValues = {
        test: [valueA, valueB]
    };

    test('Display tree values with ancestors', async () => {
        render(<TreeField recordValues={recordValues} element={mockFormElementTree} record={mockRecordWhoAmI} />);

        expect(screen.getByText(mockFormElementTree.settings.label)).toBeInTheDocument();
        expect(screen.getByText(mockRecord.whoAmI.label)).toBeInTheDocument();
        expect(screen.getByText(mockRecord2.whoAmI.label)).toBeInTheDocument();
        expect(screen.getAllByText(mockRecordAncestor.whoAmI.label)).toHaveLength(2); // Once per value
    });

    test('If multiple parents, show other paths', async () => {
        const valueMultiAncestor: IRecordPropertyTree = {
            ...valueA,
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
                    ],
                    [
                        {
                            record: mockRecordAncestor2
                        },
                        {
                            record: mockRecord
                        }
                    ]
                ]
            },
            id_value: '987654'
        };

        const recordValuesMultiAncestor = {
            test: [valueMultiAncestor]
        };

        render(
            <TreeField
                recordValues={recordValuesMultiAncestor}
                element={mockFormElementTree}
                record={mockRecordWhoAmI}
            />
        );

        expect(screen.getByText(mockRecord.whoAmI.label)).toBeInTheDocument();
        expect(screen.getByText(mockRecordAncestor.whoAmI.label)).toBeInTheDocument();

        const otherPathBtn = screen.getByRole('button', {name: 'branches', hidden: true});
        userEvent.click(otherPathBtn);

        expect(screen.getByText(mockRecordAncestor.whoAmI.label)).toBeInTheDocument();
        expect(screen.getByText(mockRecordAncestor2.whoAmI.label)).toBeInTheDocument();
    });

    test('If no values, display "add values" button', async () => {
        render(<TreeField recordValues={{test: []}} element={mockFormElementTree} record={mockRecordWhoAmI} />);

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
            />
        );

        expect(screen.queryByRole('button', {name: /add/})).not.toBeInTheDocument();
    });

    test('Can delete existing value', async () => {
        render(<TreeField recordValues={recordValues} element={mockFormElementTree} record={mockRecordWhoAmI} />);

        expect(screen.getAllByRole('button', {name: /delete/, hidden: true})).toHaveLength(2);
    });

    test('Can edit linked node', async () => {
        render(<TreeField recordValues={recordValues} element={mockFormElementTree} record={mockRecordWhoAmI} />);

        expect(screen.getAllByRole('button', {name: 'edit-record', hidden: true})).toHaveLength(2);
    });

    test('Can display value details', async () => {
        render(<TreeField recordValues={recordValues} element={mockFormElementTree} record={mockRecordWhoAmI} />);

        const valueDetailsButtons = screen.getAllByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButtons).toHaveLength(2);

        userEvent.click(valueDetailsButtons[0]);

        expect(screen.getByText('ValueDetails')).toBeInTheDocument();
    });

    test('Can select value from values list', async () => {
        const mockOnAddValue = jest.fn().mockReturnValue({
            status: APICallStatus.SUCCESS,
            value: {
                id_value: null,
                value: 'My value',
                raw_value: 'My value'
            }
        });

        jest.spyOn(useSaveValueBatchMutation, 'default').mockImplementation(() => ({
            saveValues: mockOnAddValue
        }));

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
                        attribute: mockAttribute
                    }}
                    record={mockRecordWhoAmI}
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
        expect(mockOnAddValue).toBeCalled();
    });
});
