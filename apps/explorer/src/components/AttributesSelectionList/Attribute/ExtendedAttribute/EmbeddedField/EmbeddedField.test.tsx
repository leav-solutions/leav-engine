// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeFormat} from '../../../../../_types/types';
import {mockAttributeExtended} from '../../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import EmbeddedField from './EmbeddedField';

jest.mock('../../../reducer/attributesSelectionListStateContext');

jest.mock('react-spring', () => ({
    useSpring: () => [{transform: ''}, jest.fn()],
    animated: {
        div: () => <div></div>
    }
}));

describe('ChangeAttribute', () => {
    test('Display selectable attribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
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

        expect(comp.find('input[type="checkbox"]')).toHaveLength(1);
        expect(comp.text()).toContain('field_label');
    });

    test('Display embedded fields', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
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
                                }
                            ]
                        }}
                        fieldPath={mockAttributeExtended.id + 'embeddedfield'}
                        depth={1}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('EmbeddedField')).toHaveLength(2);
        expect(comp.text()).toContain('field_label');
        expect(comp.text()).toContain('subfield_label');
    });
});
