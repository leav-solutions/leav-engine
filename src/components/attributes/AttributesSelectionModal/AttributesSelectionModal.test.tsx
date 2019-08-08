import {MockedProvider, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {AttributeType} from '../../../_gqlTypes/globalTypes';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import AttributesSelectionModal from './AttributesSelectionModal';

describe('AttributesSelection', () => {
    test('Snapshot test', async () => {
        const mocks = [
            {
                request: {
                    query: getAttributesQuery,
                    variables: {type: [AttributeType.tree]}
                },
                result: {
                    data: {
                        attributes: {
                            __typename: 'AttributesList',
                            totalCount: 0,
                            list: [
                                {
                                    ...mockAttrSimple,
                                    __typename: 'Attribute',
                                    label: {
                                        fr: 'Attr 1'
                                    },
                                    id: 'test_tree_attr'
                                },
                                {
                                    ...mockAttrSimple,
                                    __typename: 'Attribute',
                                    label: {
                                        fr: 'Attr 2'
                                    },
                                    id: 'other_test_tree_attr'
                                }
                            ]
                        }
                    }
                }
            }
        ];
        const onSubmit = jest.fn();
        const onClose = jest.fn();
        const selection = [];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks}>
                    <AttributesSelectionModal onSubmit={onSubmit} onClose={onClose} openModal selection={selection} />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        expect(comp).toMatchSnapshot();
    });
});
