import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Dropdown} from 'semantic-ui-react';
import LibraryItemsListMenuPagination from './LibraryItemsListMenuPagination';

describe('LibraryItemsListMenuPagination', () => {
    const items: any = [];
    const totalCount = 0;
    const offset = 0;
    const setOffset = jest.fn();
    const pagination = 20;
    const setPagination = jest.fn();
    const setModeSelection = jest.fn();
    const setSelected = jest.fn();

    test('Snapshot test', async () => {
        const comp = render(
            <LibraryItemsListMenuPagination
                items={items}
                totalCount={totalCount}
                offset={offset}
                setOffset={setOffset}
                pagination={pagination}
                setPagination={setPagination}
                setModeSelection={setModeSelection}
                setSelected={setSelected}
            />
        );

        expect(comp).toMatchSnapshot();
    });

    test('should display a dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <LibraryItemsListMenuPagination
                    items={items}
                    totalCount={totalCount}
                    offset={offset}
                    setOffset={setOffset}
                    pagination={pagination}
                    setPagination={setPagination}
                    setModeSelection={setModeSelection}
                    setSelected={setSelected}
                />
            );
        });

        expect(comp.find(Dropdown)).toHaveLength(1);

        // check button for selection
        expect(comp.text()).toContain('items-menu-dropdown.select-all');
        expect(comp.text()).toContain('items-menu-dropdown.select-visible');

        // check nb items selection
        expect(comp.text()).toContain('items-menu-dropdown.items-display');
    });
});
