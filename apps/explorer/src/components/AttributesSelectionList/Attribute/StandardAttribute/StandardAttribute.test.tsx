// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockAttributeStandard} from '../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import StandardAttribute from './StandardAttribute';

describe('AttributeBasic', () => {
    test('should have a checkbox', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <StandardAttribute
                        attribute={mockAttributeStandard}
                        path={mockAttributeStandard.id}
                        library="test_lib"
                        depth={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Checkbox')).toHaveLength(2);
    });
});
