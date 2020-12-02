// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getAttributesQuery} from '../../../../../queries/attributes/getAttributesQuery';
import {saveAttributeQuery} from '../../../../../queries/attributes/saveAttributeMutation';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../../../../_gqlTypes/globalTypes';
import {mockAttrAdv} from '../../../../../__mocks__/attributes';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import MetadataTab from './MetadataTab';

jest.mock(
    './MetadataList',
    () =>
        function MetadataList() {
            return <div>Metadata</div>;
        }
);

describe('MetadataTab', () => {
    const attribute: GET_ATTRIBUTES_attributes_list = {
        ...mockAttrAdv,
        label: {fr: 'Test 1', en: null}
    };

    test('Render list', async () => {
        const comp = shallow(<MetadataTab attribute={attribute} readonly={false} />);

        expect(comp.find('MetadataList')).toHaveLength(1);
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
                                        __typename: 'Attribute'
                                    },
                                    {
                                        id: 'field2',
                                        type: AttributeType.simple,
                                        format: AttributeFormat.text,
                                        label: {fr: 'field2'},
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
                                            __typename: 'Attribute'
                                        },
                                        {
                                            id: 'field2',
                                            type: AttributeType.simple,
                                            format: AttributeFormat.text,
                                            label: {fr: 'field2'},
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
