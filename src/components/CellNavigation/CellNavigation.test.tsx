import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {mockTreeElement} from '../../__mocks__/Navigation/treeElements';
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

        expect(comp.text()).toContain(mockTreeElement.record.whoAmI.label.en);
    });
});
