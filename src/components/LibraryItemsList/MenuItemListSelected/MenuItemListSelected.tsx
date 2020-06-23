import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Menu} from 'semantic-ui-react';
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

    return (
        <>
            <Menu.Item>{t('menu-selection.nb-selected', {nb: countItemsSelected})}</Menu.Item>
            <Menu.Item>
                <Button onClick={disableModeSelection}>{t('menu-selection.quit')}</Button>
            </Menu.Item>
        </>
    );
}

export default MenuItemListSelected;
