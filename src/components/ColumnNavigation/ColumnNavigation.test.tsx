// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {mockTreeElements} from '../../__mocks__/Navigation/mockTreeElements';
import ColumnNavigation from './ColumnNavigation';

describe('ColumnNavigation', () => {
    test('should call CellNavigation', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ColumnNavigation treeElements={mockTreeElements} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('CellNavigation')).toHaveLength(1);
    });
});
