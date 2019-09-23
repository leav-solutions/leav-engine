import {MockedProvider, wait} from '@apollo/react-testing';
import {InMemoryCache, IntrospectionFragmentMatcher} from 'apollo-cache-inmemory';
import {mount} from 'enzyme';
import gql from 'graphql-tag';
import React from 'react';
import {act} from 'react-dom/test-utils';
import EditRecordFormContainer from '.';
import {createRecordQuery} from '../../../../queries/records/createRecordMutation';
import {recordIdentityFragment} from '../../../../queries/records/recordIdentityFragment';
import {saveValueBatchQuery} from '../../../../queries/values/saveValueBatchMutation';
import {mockAttrAdv, mockAttrSimple} from '../../../../__mocks__/attributes';
import {mockLibrary} from '../../../../__mocks__/libraries';

jest.mock('../../../../utils/utils', () => ({
    getRecordDataQuery: () => mockQuery,
    versionObjToGraphql: () => null,
    isLinkAttribute: jest.fn().mockImplementation(a => ['advanced_link', 'simple_link'].includes(a.type))
}));

jest.mock(
    './EditRecordForm',
    () =>
        function EditRecordForm() {
            return <div>Edit form</div>;
        }
);

const mockQuery = gql`
    ${recordIdentityFragment}

    query RECORD_DATA_products($id: String!, $version: [ValueVersionInput], $lang: [AvailableLanguage!]) {
        record: products(filters: {field: id, value: $id}, version: $version) {
            list {
                id
                ...RecordIdentity
                simple_attribute {
                    value
                    id_value
                    __typename
                }
                advanced_attribute {
                    value
                    id_value
                    __typename
                }
                __typename
            }
            __typename
        }
    }
`;

describe('EditRecordFormContainer', () => {
    const mockAttributes = [{...mockAttrSimple}, {...mockAttrAdv}];
    const mockLib = {...mockLibrary};

    const mockSaveValueBatchRequest = {
        query: saveValueBatchQuery,
        variables: {
            library: 'products',
            recordId: '12345',
            version: null,
            values: [
                {attribute: 'simple_attribute', id_value: null, value: 'Val'},
                {
                    attribute: 'advanced_attribute',
                    id_value: 98765,
                    value: 'Adv Val'
                }
            ]
        }
    };

    const mockQueryRecordDataResult = {
        data: {
            record: {
                __typename: 'ProductList',
                list: [
                    {
                        id: 12345,
                        simple_attribute: {
                            id_value: null,
                            value: 'Val',
                            __typename: 'Value'
                        },
                        advanced_attribute: {
                            id_value: 98765,
                            value: 'Adv Val',
                            __typename: 'Value'
                        },
                        whoAmI: {
                            id: 12345,
                            library: {
                                id: 'products',
                                label: {
                                    fr: 'Produits'
                                },
                                __typename: 'Library'
                            },
                            label: 'MyLabelAfterUpdate',
                            color: null,
                            preview: null,
                            __typename: 'RecordIdentity'
                        },
                        __typename: 'Product'
                    }
                ]
            }
        }
    };

    const mockSaveValueBatchResult = {
        data: {
            saveValueBatch: {
                __typename: 'saveValueBatchResult',
                values: [
                    {
                        __typename: 'Value',
                        attribute: 'simple_attribute',
                        id_value: null,
                        value: 'Val',
                        raw_value: 'Val',
                        modified_at: 1234567890,
                        created_at: 1234567890,
                        version: null
                    },
                    {
                        __typename: 'Value',
                        attribute: 'advanced_attribute',
                        id_value: 98765,
                        value: 'Adv Val',
                        raw_value: 'Adv Val',
                        modified_at: 1234567890,
                        created_at: 1234567890,
                        version: null
                    }
                ],
                errors: null
            }
        }
    };

    // Define matcher to avoid warnings with fragments
    const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData: {
            __schema: {
                types: [
                    {
                        kind: 'INTERFACE',
                        name: 'Record',
                        possibleTypes: [
                            {
                                name: 'Product'
                            }
                        ]
                    }
                ]
            }
        }
    });

    let cache;
    beforeEach(() => {
        // Set a new cache for each test to avoid fetching data in cache and not in provided mocls
        cache = new InMemoryCache({fragmentMatcher});
    });

    test('Loading and success state on existing record', async () => {
        let recordDataQueryCalled = false;
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: () => {
                    recordDataQueryCalled = true;
                    return mockQueryRecordDataResult;
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer attributes={mockAttributes} library={mockLib} recordId="12345" />
                </MockedProvider>
            );
        });

        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('EditRecordForm');
        expect(formContainer).toHaveLength(1);
        expect(recordDataQueryCalled).toBe(true);
    });

    test('Loading and success state on new record', async () => {
        let recordDataQueryCalled = false;
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: () => {
                    recordDataQueryCalled = true;
                    return {
                        data: {
                            record: {
                                __typename: 'ProductList',
                                list: []
                            }
                        }
                    };
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer attributes={mockAttributes} library={mockLib} recordId="" />
                </MockedProvider>
            );
        });

        const formContainer = comp.find('EditRecordForm');
        expect(formContainer).toHaveLength(1);
        expect(recordDataQueryCalled).toBe(false);
    });

    test('Error state', async () => {
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                error: new Error('Boom!')
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer attributes={mockAttributes} library={mockLib} recordId="12345" />
                </MockedProvider>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('.error')).toHaveLength(1);
    });

    test('Submit existing record', async () => {
        let saveDataMutationCalled = false;
        let fetchRecordDataCount = 0;
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: () => {
                    fetchRecordDataCount++;
                    return mockQueryRecordDataResult;
                }
            },
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: () => {
                    fetchRecordDataCount++;
                    return mockQueryRecordDataResult;
                }
            },
            {
                request: mockSaveValueBatchRequest,
                result: () => {
                    saveDataMutationCalled = true;
                    return mockSaveValueBatchResult;
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer attributes={mockAttributes} library={mockLib} recordId="12345" />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('EditRecordForm');
        await act(async () =>
            formContainer.prop('onSave')({
                simple_attribute: {
                    id_value: null,
                    value: 'Val'
                },
                advanced_attribute: {
                    id_value: 98765,
                    value: 'Adv Val'
                }
            })
        );

        await act(async () => {
            await wait(0);
            comp.update();
        });
        expect(saveDataMutationCalled).toBe(true);
        expect(fetchRecordDataCount).toBe(2);
    });

    test('Submit new record', async () => {
        let saveDataMutationCalled = false;
        let fetchRecordDataCount = 0;
        let createRecordCalled = false;
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: () => {
                    fetchRecordDataCount++;
                    return mockQueryRecordDataResult;
                }
            },
            {
                request: {
                    query: createRecordQuery,
                    variables: {library: 'products'}
                },
                result: () => {
                    createRecordCalled = true;
                    return {
                        data: {
                            createRecord: {
                                id: '12345',
                                __typename: 'Product'
                            }
                        }
                    };
                }
            },
            {
                request: {
                    query: saveValueBatchQuery,
                    variables: {
                        library: 'products',
                        recordId: '12345',
                        version: null,
                        values: [
                            {attribute: 'simple_attribute', id_value: null, value: 'Val'},
                            {
                                attribute: 'advanced_attribute',
                                id_value: 98765,
                                value: 'Adv Val'
                            }
                        ]
                    }
                },
                result: () => {
                    saveDataMutationCalled = true;
                    return mockSaveValueBatchResult;
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer attributes={mockAttributes} library={mockLib} recordId="" />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('EditRecordForm');
        await act(async () =>
            formContainer.prop('onSave')({
                simple_attribute: {
                    id_value: null,
                    value: 'Val'
                },
                advanced_attribute: {
                    id_value: 98765,
                    value: 'Adv Val'
                }
            })
        );

        await act(async () => {
            await wait(0);
            comp.update();
        });
        expect(saveDataMutationCalled).toBe(true);
        expect(createRecordCalled).toBe(true);
        expect(fetchRecordDataCount).toBe(1);
    });

    test('Retrieve label', async () => {
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: {
                    data: {
                        record: {
                            __typename: 'ProductList',
                            list: [
                                {
                                    id: 12345,
                                    simple_attribute: {
                                        id_value: null,
                                        value: 'Val',
                                        __typename: 'Value'
                                    },
                                    advanced_attribute: {
                                        id_value: 98765,
                                        value: 'Adv Val',
                                        __typename: 'Value'
                                    },
                                    whoAmI: {
                                        id: 12345,
                                        library: {
                                            id: 'products',
                                            label: {
                                                fr: 'Produits'
                                            },
                                            __typename: 'Library'
                                        },
                                        label: 'MyLabel',
                                        color: null,
                                        preview: null,
                                        __typename: 'RecordIdentity'
                                    },
                                    __typename: 'Product'
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: {
                    data: {
                        record: {
                            __typename: 'ProductList',
                            list: [
                                {
                                    id: 12345,
                                    simple_attribute: {
                                        id_value: null,
                                        value: 'Val',
                                        __typename: 'Value'
                                    },
                                    advanced_attribute: {
                                        id_value: 98765,
                                        value: 'Adv Val',
                                        __typename: 'Value'
                                    },
                                    whoAmI: {
                                        id: 12345,
                                        library: {
                                            id: 'products',
                                            label: {
                                                fr: 'Produits'
                                            },
                                            __typename: 'Library'
                                        },
                                        label: 'MyLabelAfterUpdate',
                                        color: null,
                                        preview: null,
                                        __typename: 'RecordIdentity'
                                    },
                                    __typename: 'Product'
                                }
                            ]
                        }
                    }
                }
            },
            {
                request: mockSaveValueBatchRequest,
                result: {
                    data: {
                        saveValueBatch: {
                            __typename: 'saveValueBatchResult',
                            values: [
                                {
                                    __typename: 'Value',
                                    attribute: 'simple_attribute',
                                    id_value: null,
                                    value: 'Val',
                                    raw_value: 'Val',
                                    modified_at: 1234567890,
                                    created_at: 1234567890,
                                    version: null
                                }
                            ],
                            errors: null
                        }
                    }
                }
            }
        ];

        let comp;
        const onIdentityUpdate = jest.fn();
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer
                        attributes={mockAttributes}
                        library={mockLib}
                        recordId="12345"
                        onIdentityUpdate={onIdentityUpdate}
                    />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('EditRecordForm');
        await act(async () =>
            formContainer.prop('onSave')({
                simple_attribute: {
                    id_value: null,
                    value: 'Val'
                },
                advanced_attribute: {
                    id_value: 98765,
                    value: 'Adv Val'
                }
            })
        );

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(onIdentityUpdate).toBeCalledWith({
            id: 12345,
            library: {
                id: 'products',
                label: {
                    fr: 'Produits'
                },
                __typename: 'Library'
            },
            label: 'MyLabelAfterUpdate',
            color: null,
            preview: null,
            __typename: 'RecordIdentity'
        });

        expect(onIdentityUpdate).toBeCalledWith({
            id: 12345,
            library: {
                id: 'products',
                label: {
                    fr: 'Produits'
                },
                __typename: 'Library'
            },
            label: 'MyLabel',
            color: null,
            preview: null,
            __typename: 'RecordIdentity'
        });
    });

    test('Calls onPostSave', async () => {
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: mockQueryRecordDataResult
            },
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: mockQueryRecordDataResult
            },
            {
                request: mockSaveValueBatchRequest,
                result: mockSaveValueBatchResult
            }
        ];

        const onPostSave = jest.fn();
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer
                        attributes={mockAttributes}
                        library={mockLib}
                        recordId="12345"
                        onPostSave={onPostSave}
                    />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('EditRecordForm');
        await act(async () =>
            formContainer.prop('onSave')({
                simple_attribute: {
                    id_value: null,
                    value: 'Val'
                },
                advanced_attribute: {
                    id_value: 98765,
                    value: 'Adv Val'
                }
            })
        );

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(onPostSave).toBeCalled();
    });

    test("Don't call onPostSave if errors", async () => {
        const mocks = [
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: mockQueryRecordDataResult
            },
            {
                request: {
                    query: mockQuery,
                    variables: {id: '12345', version: null, lang: ['fr']}
                },
                result: mockQueryRecordDataResult
            },
            {
                request: mockSaveValueBatchRequest,
                result: {
                    data: {
                        saveValueBatch: {
                            __typename: 'saveValueBatchResult',
                            values: [],
                            errors: [
                                {
                                    __typename: 'ValueBatchError',
                                    type: 'VALIDATION_ERROR',
                                    attribute: 'simple_attribute',
                                    input: 'Val',
                                    message: 'Invalid value'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const onPostSave = jest.fn();
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename cache={cache}>
                    <EditRecordFormContainer
                        attributes={mockAttributes}
                        library={mockLib}
                        recordId="12345"
                        onPostSave={onPostSave}
                    />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        const formContainer = comp.find('EditRecordForm');
        await act(async () =>
            formContainer.prop('onSave')({
                simple_attribute: {
                    id_value: null,
                    value: 'Val'
                },
                advanced_attribute: {
                    id_value: 98765,
                    value: 'Adv Val'
                }
            })
        );

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(onPostSave).not.toBeCalled();
    });
});
