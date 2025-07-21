// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
                                    values: [],
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
                wrapper: ({children}) => <MockedProvider mocks={mocks}>{children}</MockedProvider>
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
                    values: [],
                    settings: []
                }
            ]
        });
    });

    test('Run query and format result, with empty metadata', async () => {
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
                                    values: [],
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
                wrapper: ({children}) => <MockedProvider mocks={mocks}>{children}</MockedProvider>
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
                    values: [],
                    settings: []
                }
            ]
        });
    });
});
