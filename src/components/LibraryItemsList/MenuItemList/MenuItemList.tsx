import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown, DropdownProps, Menu, Popup} from 'semantic-ui-react';
import {displayListItemTypes} from '../../../_types/types';
import LibraryItemsListMenuPagination from '../LibraryItemsListMenuPagination';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import SearchItems from '../SearchItems';
import SelectView from '../SelectView';

interface IMenuItemListProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    refetch: any;
}

function MenuItemList({stateItems, dispatchItems, refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();

    const displayOptions = [
        {
            key: 'list-small',
            text: t('items_list.display.list-small'),
            value: displayListItemTypes.listSmall,
            icon: 'list layout'
        },
        {
            key: 'list-medium',
            text: t('items_list.display.list-medium'),
            value: displayListItemTypes.listMedium,
            icon: 'list layout'
        },
        {
            key: 'list-big',
            text: t('items_list.display.list-big'),
            value: displayListItemTypes.listBig,
            icon: 'list layout'
        },
        {
            key: 'tile',
            text: t('items_list.display.tile'),
            value: displayListItemTypes.tile,
            icon: 'th large',
            default: true
        }
    ];

    const changeDisplay = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newDisplay = data.value?.toString();

        if (newDisplay) {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE,
                displayType: displayListItemTypes[newDisplay]
            });
        }
    };

    const toggleShowFilter = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTER,
            showFilter: !stateItems.showFilters
        });
    };

    return (
        <>
            {!stateItems.showFilters && (
                <>
                    <Menu.Item>
                        <Popup
                            content={t('items_list.show-filter-panel')}
                            trigger={<Button icon="sidebar" onClick={toggleShowFilter} />}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <SelectView />
                    </Menu.Item>
                </>
            )}
            <Menu.Item>
                <LibraryItemsListMenuPagination stateItems={stateItems} dispatchItems={dispatchItems} />
            </Menu.Item>

            <Menu.Item>
                <SearchItems dispatchItems={dispatchItems} />
            </Menu.Item>

            <Menu.Menu position="right">
                <Menu.Item>
                    <Button icon="plus" content={t('items_list.new')} />
                </Menu.Item>

                <Dropdown
                    text={t('items_list.display_type')}
                    item
                    options={displayOptions}
                    defaultValue={stateItems.displayType}
                    onChange={changeDisplay}
                />

                <Menu.Item>
                    <Button icon="redo" onClick={() => refetch && refetch()}></Button>
                </Menu.Item>
            </Menu.Menu>
        </>
    );
}

export default MenuItemList;
