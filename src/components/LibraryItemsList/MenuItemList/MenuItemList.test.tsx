import {render} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import MenuItemList from './MenuItemList';

describe('MenuItemList', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <MenuItemList
                    showFilters={false}
                    setShowFilters={jest.fn()}
                    items={[]}
                    setDisplay={jest.fn()}
                    totalCount={0}
                    offset={0}
                    setOffset={jest.fn()}
                    pagination={20}
                    setModeSelection={jest.fn()}
                    setPagination={jest.fn()}
                    setSelected={jest.fn()}
                    setQueryFilters={jest.fn()}
                    refetch={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
