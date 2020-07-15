import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown, Menu} from 'semantic-ui-react';
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
        <>
            <Menu.Item>
                <Dropdown
                    text={
                        stateItems.allSelected
                            ? t('menu-selection.all-selected-enabled')
                            : t('menu-selection.nb-selected', {nb: countItemsSelected})
                    }
                >
                    <Dropdown.Menu>
                        <Dropdown.Item
                            onClick={selectVisible}
                            text={t('items-menu-dropdown.select-visible', {nb: stateItems.items?.length})}
                        />
                        <Dropdown.Item
                            onClick={selectAll}
                            text={t('items-menu-dropdown.select-all', {nb: stateItems.itemsTotalCount})}
                        />
                        <Dropdown.Item onClick={unselectAll} text={t('menu-selection.unselect-all')} />
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Item>
            <Menu.Item>
                <Dropdown text={t('menu-selection.actions')}></Dropdown>
            </Menu.Item>

            <Menu.Item>
                <Button onClick={disableModeSelection}>{t('menu-selection.quit')}</Button>
            </Menu.Item>
        </>
    );
}

export default MenuItemListSelected;
