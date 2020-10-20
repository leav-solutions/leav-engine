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
