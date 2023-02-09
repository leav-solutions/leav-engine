// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {GET_ATTRIBUTES_BY_LIB} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {act, render, screen, within} from '_tests/testUtils';
import {getAttributesByLibQuery} from '../../graphQL/queries/attributes/getAttributesByLib';
import {AttributeFormat, AttributeType} from '../../_gqlTypes/globalTypes';
import AttributesSelectionList from './AttributesSelectionList';

describe('AttributesSelectionList', () => {
    test('Can select attributes in list', async () => {
        const mocks: Array<MockedResponse<GET_ATTRIBUTES_BY_LIB>> = [
            {
                request: {
                    query: getAttributesByLibQuery,
                    variables: {
                        library: 'test_lib'
                    }
                },
                result: {
                    data: {
                        attributes: {
                            list: [
                                {
                                    id: 'test_lib',
                                    type: AttributeType.simple,
                                    format: AttributeFormat.text,
                                    label: {fr: 'test attribute'},
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

        await act(async () => {
            render(
                <AttributesSelectionList selectedAttributes={[]} library="test_lib" onSelectionChange={jest.fn()} />,
                {apolloMocks: mocks}
            );
        });

        const attributesList = await screen.findByTestId('attributes-list');
        const attributeElem = within(attributesList).getByText('test attribute');

        expect(attributeElem).toBeInTheDocument();

        await act(async () => {
            userEvent.click(attributeElem);
        });

        const selectedAttributesList = screen.getByTestId('attributes-list');
        expect(within(selectedAttributesList).getByText('test attribute')).toBeInTheDocument();
    });

    test('Can filter list of attributes', async () => {
        const mocks: Array<MockedResponse<GET_ATTRIBUTES_BY_LIB>> = [
            {
                request: {
                    query: getAttributesByLibQuery,
                    variables: {
                        library: 'test_lib'
                    }
                },
                result: {
                    data: {
                        attributes: {
                            list: [
                                {
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

        await act(async () => {
            render(
                <AttributesSelectionList selectedAttributes={[]} library="test_lib" onSelectionChange={jest.fn()} />,
                {apolloMocks: mocks}
            );
        });

        const attributesList = await screen.findByTestId('attributes-list');

        expect(within(attributesList).getAllByTestId('attribute-in-list')).toHaveLength(2);

        await act(async () => {
            userEvent.type(screen.getByRole('textbox', {name: /search/}), 'attributeb');
        });

        await within(attributesList).findAllByTestId('attribute-in-list');

        expect(within(attributesList).getAllByTestId('attribute-in-list')).toHaveLength(1);
        expect(within(attributesList).queryByText('attributeA')).not.toBeInTheDocument();
        expect(within(attributesList).queryByText('attributeB')).toBeInTheDocument();
    });
});
