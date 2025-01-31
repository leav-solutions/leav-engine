// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {AttributeFormat, AttributeType, GetAttributesByLibDocument} from '_ui/_gqlTypes';
import {act, render, screen, within} from '_ui/_tests/testUtils';
import AttributesSelectionList from './AttributesSelectionList';

describe('AttributesSelectionList', () => {
    test('Can select attributes in list', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributesByLibDocument,
                    variables: {
                        library: 'test_lib'
                    }
                },
                result: {
                    data: {
                        attributes: {
                            list: [
                                {
                                    __typename: 'StandardAttribute',
                                    id: 'test_lib',
                                    type: AttributeType.simple,
                                    format: AttributeFormat.text,
                                    label: {fr: 'test attribute'},
                                    multiple_values: false,
                                    system: false,
                                    readonly: false,
                                    embedded_fields: null
                                }
                            ]
                        }
                    }
                }
            }
        ];

        render(<AttributesSelectionList selectedAttributes={[]} library="test_lib" onSelectionChange={jest.fn()} />, {
            mocks
        });

        const attributesList = await screen.findByTestId('attributes-list');
        const attributeElem = await within(attributesList).findByText('test attribute');

        expect(attributeElem).toBeInTheDocument();

        await act(async () => {
            userEvent.click(attributeElem);
        });

        const selectedAttributesList = screen.getByTestId('attributes-list');
        expect(await within(selectedAttributesList).findByText('test attribute')).toBeInTheDocument();
    });

    test('Can filter list of attributes', async () => {
        const mocks = [
            {
                request: {
                    query: GetAttributesByLibDocument,
                    variables: {
                        library: 'test_lib'
                    }
                },
                result: {
                    data: {
                        attributes: {
                            list: [
                                {
                                    __typename: 'StandardAttribute',
                                    id: 'attrA',
                                    type: AttributeType.simple,
                                    format: AttributeFormat.text,
                                    label: {fr: 'attributeA'},
                                    multiple_values: false,
                                    embedded_fields: null,
                                    system: false,
                                    readonly: false
                                },
                                {
                                    __typename: 'StandardAttribute',
                                    id: 'attrB',
                                    type: AttributeType.simple,
                                    format: AttributeFormat.text,
                                    label: {fr: 'attributeB'},
                                    multiple_values: false,
                                    embedded_fields: null,
                                    system: false,
                                    readonly: false
                                }
                            ]
                        }
                    }
                }
            }
        ];

        render(<AttributesSelectionList selectedAttributes={[]} library="test_lib" onSelectionChange={jest.fn()} />, {
            mocks
        });

        const attributesList = await screen.findByTestId('attributes-list');

        expect(within(attributesList).getAllByTestId('attribute-in-list')).toHaveLength(2);

        await userEvent.type(screen.getByRole('textbox', {name: /search/}), 'attributeb');

        expect(within(attributesList).getAllByTestId('attribute-in-list')).toHaveLength(1);
        expect(within(attributesList).queryByText('attributeA')).not.toBeInTheDocument();
        expect(within(attributesList).queryByText('attributeB')).toBeInTheDocument();
    });
});
