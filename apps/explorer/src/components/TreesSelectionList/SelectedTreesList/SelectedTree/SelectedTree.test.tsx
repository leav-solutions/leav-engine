// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockTree} from '../../../../__mocks__/common/tree';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import SelectedTree from './SelectedTree';

describe('ItemSelected', () => {
    test('should display id', async () => {
        let comp: any;

        await act(async () => {
            comp = render(
                <MockedProviderWithFragments>
                    <SelectedTree handleProps={{}} selectedTree={mockTree} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.text()).toContain(mockTree!.label!.fr);
    });
});
