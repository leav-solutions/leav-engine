// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockTree} from '../../../__mocks__/common/tree';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Tree from './Tree';

jest.mock(
    './Tree',
    () =>
        function T() {
            return <>Tree</>;
        }
);

describe('Tree', () => {
    test('should call Tree', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Tree tree={mockTree} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('T')).toHaveLength(1);
    });
});
