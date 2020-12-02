// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {mockTreeElement} from '../../__mocks__/Navigation/mockTreeElements';
import CellNavigation from './CellNavigation';

describe('CellNavigation', () => {
    test('should display the label of the record', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <CellNavigation treeElement={mockTreeElement} depth={0} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockTreeElement.record.whoAmI.label);
    });
});
