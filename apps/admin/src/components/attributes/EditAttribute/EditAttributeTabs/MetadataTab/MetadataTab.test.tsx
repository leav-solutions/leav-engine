// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {wait} from 'utils/testUtils';
import {act, render, screen} from '_tests/testUtils';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {AttributeFormat, AttributeType} from '../../../../../_gqlTypes/globalTypes';
import {mockAttrAdv} from '../../../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import MetadataTab from './MetadataTab';

jest.mock(
    './MetadataList',
    () =>
        function MetadataList() {
            return <div>MetadataList</div>;
        }
);

describe('MetadataTab', () => {
    const attribute = {
        ...mockAttrAdv,
        label: {fr: 'Test 1', en: null}
    };

    test('Render list', async () => {
        await act(async () => {
            render(<MetadataTab attribute={attribute} readonly={false} />);
        });

        expect(screen.getByText('MetadataList')).toBeInTheDocument();
    });

    test('Save new fields on change', async () => {
        let saveQueryCalled = false;
        const mocks = [
            {
                request: {
                    query: saveAttributeQuery,
                    variables: {
                        attrData: {id: attribute.id, metadata_fields: ['field1', 'field2']}
                    }
                },
                result: () => {
                    saveQueryCalled = true;
                    return {
                        data: {
                            saveAttribute: {
                                ...attribute,
                                __typename: 'Attribute',
                                versions_conf: null,
                                metadata_fields: [
                                    {
                                        id: 'field1',
                                        type: AttributeType.simple,
                                        format: AttributeFormat.text,
                                        label: {fr: 'field1'},
                                        description: {fr: 'field1'},
                                        __typename: 'Attribute'
                                    },
                                    {
                                        id: 'field2',
                                        type: AttributeType.simple,
                                        format: AttributeFormat.text,
                                        label: {fr: 'field2'},
                                        description: {fr: 'field1'},
                                        __typename: 'Attribute'
                                    }
                                ]
                            }
                        }
                    };
                }
            },
            {
                request: {
                    query: getAttributesQuery,
                    variables: {id: attribute.id}
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 1,
                            list: [
                                {
                                    ...mockAttrAdv,
                                    __typename: 'Attribute',
                                    versions_conf: null,
                                    metadata_fields: [
                                        {
                                            id: 'field1',
                                            type: AttributeType.simple,
                                            format: AttributeFormat.text,
                                            label: {fr: 'field1'},
                                            description: {fr: 'field1'},
                                            __typename: 'Attribute'
                                        },
                                        {
                                            id: 'field2',
                                            type: AttributeType.simple,
                                            format: AttributeFormat.text,
                                            label: {fr: 'field2'},
                                            description: {fr: 'field2'},
                                            __typename: 'Attribute'
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <MetadataTab attribute={attribute} readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const onChangeFunc: any = comp.find('MetadataList').prop('onChange');
        if (!!onChangeFunc) {
            await act(async () => {
                await onChangeFunc(['field1', 'field2']);
                await wait(0);
            });
        }

        expect(saveQueryCalled).toBe(true);
    });
});
