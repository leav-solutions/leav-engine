// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockTreeElement} from '../../__mocks__/common/treeElements';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import CellNavigation from './CellNavigation';

describe('CellNavigation', () => {
    test('should display the label of the record', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <CellNavigation treeElement={mockTreeElement} depth={0} />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockTreeElement.record.whoAmI.label);
    });
});
