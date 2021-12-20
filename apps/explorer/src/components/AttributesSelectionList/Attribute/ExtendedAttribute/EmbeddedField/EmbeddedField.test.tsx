// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {mockAttributeExtended} from '../../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import EmbeddedField from './EmbeddedField';

jest.mock('../../../reducer/attributesSelectionListStateContext');

describe('ChangeAttribute', () => {
    test('Display selectable attribute', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <EmbeddedField
                        attribute={mockAttributeExtended}
                        library="test_lib"
                        field={{
                            id: 'embedded_field',
                            format: AttributeFormat.text,
                            label: {fr: 'field_label'},
                            embedded_fields: []
                        }}
                        fieldPath={mockAttributeExtended.id + 'embeddedfield'}
                        depth={1}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByText('field_label')).toBeInTheDocument();
    });

    test('Display embedded fields', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <EmbeddedField
                        attribute={mockAttributeExtended}
                        library="test_lib"
                        field={{
                            id: 'embedded_field',
                            format: AttributeFormat.extended,
                            label: {fr: 'field_label'},
                            embedded_fields: [
                                {
                                    id: 'sub_field',
                                    format: AttributeFormat.text,
                                    label: {fr: 'subfield_label'},
                                    embedded_fields: []
                                },
                                {
                                    id: 'sub_field_2',
                                    format: AttributeFormat.text,
                                    label: {fr: 'subfield_label_2'},
                                    embedded_fields: []
                                }
                            ]
                        }}
                        fieldPath={mockAttributeExtended.id + 'embeddedfield'}
                        depth={1}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByTestId('embedded-field')).toHaveLength(2);
        expect(screen.getByText('field_label')).toBeInTheDocument();
        expect(screen.getByText('subfield_label')).toBeInTheDocument();
    });
});
