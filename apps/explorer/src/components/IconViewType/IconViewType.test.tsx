// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {ViewTypes} from '_gqlTypes/globalTypes';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import IconViewType from './IconViewType';

describe('IconViewType', () => {
    test("shouldn't show description", async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <IconViewType type={ViewTypes.list} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('IconViewList')).toHaveLength(1);
        expect(comp.text()).not.toContain('view.type-list');
    });

    test('should show description', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <IconViewType type={ViewTypes.list} showDescription={true} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('IconViewList')).toHaveLength(1);
        expect(comp.text()).toContain('view.type-list');
    });
});
