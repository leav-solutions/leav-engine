// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {ILabel} from '../../../../_types/types';
import {mockAttributeLink} from '../../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import RecordLinkAttribute from './RecordLinkAttribute';

jest.mock('react-spring', () => ({
    useSpring: () => [{transform: ''}, jest.fn()],
    animated: {
        div: () => <div></div>
    }
}));

describe('AttributeLinkedLibrary', () => {
    test('should contain mockAttribute label', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <RecordLinkAttribute
                        attribute={mockAttributeLink}
                        path={mockAttributeLink.id}
                        library="test_lib"
                        depth={0}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain((mockAttributeLink.label as ILabel).fr);
    });
});
