// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {FormElementTypes, RecordFormDocument} from '_ui/_gqlTypes';
import {renderHook, waitFor} from '_ui/_tests/testUtils';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import useGetRecordForm from './useGetRecordForm';

describe('useGetRecordForm', () => {
    test('Run query and format result', async () => {
        const mocks = [
            {
                request: {
                    query: RecordFormDocument,
                    variables: {
                        libraryId: 'test_lib',
                        recordId: '987654',
                        formId: 'edition',
                        version: [
                            {
                                treeId: 'tree_1',
                                treeNodeId: '1337'
                            }
                        ]
                    }
                },
                result: {
                    data: {
                        recordForm: {
                            id: 'edition',
                            recordId: '987654',
                            library: {
                                id: 'test_lib'
                            },
                            elements: [
                                {
                                    id: '123456789',
                                    containerId: '_root',
                                    uiElementType: 'text_input',
                                    attribute: {
                                        ...mockFormAttribute,
                                        values_list: null,
                                        __typename: 'StandardAttribute'
                                    },
                                    type: FormElementTypes.field,
                                    valueError: null,
                                    values: [
                                        {
                                            __typename: 'Value',
                                            id_value: '987654321',
                                            created_at: 1234567890,
                                            modified_at: 1234567890,
                                            created_by: {
                                                __typename: 'User',
                                                id: '1',
                                                whoAmI: mockRecord
                                            },
                                            modified_by: {
                                                __typename: 'User',
                                                id: '1',
                                                whoAmI: mockRecord
                                            },
                                            metadata: null,
                                            version: [
                                                {
                                                    __typename: 'ValueVersion',
                                                    treeId: 'tree_1',
                                                    treeNode: {
                                                        id: '1337',
                                                        record: {
                                                            id: '1337',
                                                            whoAmI: {
                                                                id: '1337',
                                                                label: 'Some tree element',
                                                                library: {
                                                                    id: 'test_lib'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            ],
                                            value: 'some value',
                                            raw_value: 'some value'
                                        }
                                    ],
                                    settings: []
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(
            () =>
                useGetRecordForm({
                    libraryId: 'test_lib',
                    recordId: '987654',
                    formId: 'edition',
                    version: {tree_1: {id: '1337', label: 'Some tree element'}}
                }),
            {
                wrapper: ({children}) => <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
            }
        );

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeUndefined();
        expect(result.current.recordForm).toMatchObject({
            id: 'edition',
            recordId: '987654',
            library: {
                id: 'test_lib'
            },
            elements: [
                {
                    id: '123456789',
                    containerId: '_root',
                    uiElementType: 'text_input',
                    type: FormElementTypes.field,
                    valueError: null,
                    attribute: {...mockFormAttribute, values_list: null},
                    values: [
                        {
                            id_value: '987654321',
                            created_at: 1234567890,
                            modified_at: 1234567890,
                            created_by: {
                                id: '1',
                                whoAmI: mockRecord
                            },
                            modified_by: {
                                id: '1',
                                whoAmI: mockRecord
                            },
                            metadata: [],
                            version: {
                                tree_1: {
                                    id: '1337',
                                    label: 'Some tree element'
                                }
                            },
                            value: 'some value',
                            raw_value: 'some value'
                        }
                    ],
                    settings: []
                }
            ]
        });
    });
});