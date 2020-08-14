import {Button, Menu} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';

interface IMenuItemListSelectedProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function MenuItemListSelected({stateItems, dispatchItems}: IMenuItemListSelectedProps): JSX.Element {
    const {t} = useTranslation();

    const [countItemsSelected, setCountItemsSelected] = useState(0);

    const disableModeSelection = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: false
        });
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {}
        });
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ALL_SELECTED,
            allSelected: false
        });
    };

    useEffect(() => {
        let count = 0;
        for (const itemId in stateItems.itemsSelected) {
            if (stateItems.itemsSelected[itemId]) {
                count++;
            }
        }

        setCountItemsSelected(count);
    }, [stateItems.itemsSelected, setCountItemsSelected]);

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
            type: LibraryItemListReducerActionTypes.SET_ALL_SELECTED,
            allSelected: false
        });
    };

    const selectAll = () => {
        // reset selected elements
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {}
        });

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ALL_SELECTED,
            allSelected: true
        });
    };

    const unselectAll = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: {}
        });
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ALL_SELECTED,
            allSelected: false
        });
    };

    return (
        <Menu>
            <Menu.SubMenu
                title={
                    stateItems.allSelected
                        ? t('menu-selection.all-selected-enabled')
                        : t('menu-selection.nb-selected', {nb: countItemsSelected})
                }
            >
                <Menu.Item onClick={selectVisible}>
                    {t('items-menu-dropdown.select-visible', {nb: stateItems.items?.length})}
                </Menu.Item>
                <Menu.Item onClick={selectAll}>
                    {t('items-menu-dropdown.select-all', {nb: stateItems.itemsTotalCount})}
                </Menu.Item>
                <Menu.Item onClick={unselectAll}>{t('menu-selection.unselect-all')}</Menu.Item>
            </Menu.SubMenu>

            <Menu.SubMenu title={t('menu-selection.actions')}>
                <Menu.Item>some actions</Menu.Item>
            </Menu.SubMenu>

            <Menu.Item>
                <Button onClick={disableModeSelection}>{t('menu-selection.quit')}</Button>
            </Menu.Item>
        </Menu>
    );
}

export default MenuItemListSelected;
