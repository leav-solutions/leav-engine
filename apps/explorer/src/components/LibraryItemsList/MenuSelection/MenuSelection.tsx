// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {
    ILibraryItemListState,
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes
} from '../LibraryItemsListReducer';

interface IMenuSelectionProps {
    stateItems: ILibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function MenuSelection({stateItems, dispatchItems}: IMenuSelectionProps): JSX.Element {
    const {t} = useTranslation();

    const offsetDisplay = stateItems.itemsTotalCount > 0 ? stateItems.offset + 1 : 0;
    const nextOffsetDisplay =
        stateItems.offset + stateItems.pagination > stateItems.itemsTotalCount
            ? stateItems.itemsTotalCount
            : stateItems.offset + stateItems.pagination;

    const selectAll = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {}
        });
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ALL_SELECTED,
            allSelected: true
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: true
        });
    };
    const selectVisible = () => {
        const newItemSelected = {};

        if (stateItems.items) {
            for (const item of stateItems.items) {
                newItemSelected[item.id] = true;
            }
        }

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: newItemSelected
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: true
        });
    };

    return (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item onClick={selectAll}>
                        {t('items-menu-dropdown.select-all', {nb: stateItems.itemsTotalCount})}
                    </Menu.Item>
                    <Menu.Item onClick={selectVisible}>
                        {t('items-menu-dropdown.select-visible', {nb: stateItems.items?.length})}
                    </Menu.Item>
                </Menu>
            }
        >
            <span>
                {t('items-list-row.nb-elements', {
                    nb1: offsetDisplay,
                    nb2: nextOffsetDisplay,
                    nbItems: stateItems.itemsTotalCount
                })}
                <DownOutlined style={{paddingLeft: 6}} />
            </span>
        </Dropdown>
    );
}

export default MenuSelection;
