// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import AttributeLinkedTree from '.';
import {ILabel} from '../../../../_types/types';
import {mockAttributeTree} from '../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';

jest.mock('react-spring', () => ({
    useSpring: () => [{transform: ''}, jest.fn()],
    animated: {
        div: () => <div></div>
    }
}));

describe('AttributeLinkedTree', () => {
    test('should contain label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AttributeLinkedTree
                        attribute={mockAttributeTree}
                        path={mockAttributeTree.id}
                        library="test_lib"
                        depth={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain((mockAttributeTree.label as ILabel).en);
    });
});
