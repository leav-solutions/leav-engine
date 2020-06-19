import {shallow} from 'enzyme';
import React from 'react';
import MenuItemList from './MenuItemList';

jest.mock('../LibraryItemsListMenuPagination', () => {
    return function LibraryItemsListMenuPagination() {
        return <div>LibraryItemsListMenuPagination</div>;
    };
});

describe('MenuItemList', () => {
    test('Snapshot test', async () => {
        const comp = shallow(
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
        );

        expect(comp).toMatchSnapshot();
    });
});
