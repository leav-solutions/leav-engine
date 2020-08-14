import {FilterOutlined, PlusOutlined, RedoOutlined} from '@ant-design/icons';
import {Button, Menu, Select, Tooltip} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {DisplayListItemTypes} from '../../../_types/types';
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
            value: DisplayListItemTypes.listSmall,
            icon: 'list layout'
        },
        {
            key: 'list-medium',
            text: t('items_list.display.list-medium'),
            value: DisplayListItemTypes.listMedium,
            icon: 'list layout'
        },
        {
            key: 'list-big',
            text: t('items_list.display.list-big'),
            value: DisplayListItemTypes.listBig,
            icon: 'list layout'
        },
        {
            key: 'tile',
            text: t('items_list.display.tile'),
            value: DisplayListItemTypes.tile,
            icon: 'th large',
            default: true
        }
    ];

    const changeDisplay = (value: string) => {
        const newDisplay = value?.toString();

        if (newDisplay) {
            dispatchItems({
                type: LibraryItemListReducerActionTypes.SET_DISPLAY_TYPE,
                displayType: DisplayListItemTypes[newDisplay]
            });
        }
    };

    const toggleShowFilter = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTERS,
            showFilters: !stateItems.showFilters
        });
    };

    return (
        <Menu>
            {!stateItems.showFilters && (
                <>
                    <Menu.Item>
                        <Tooltip title={t('items_list.show-filter-panel')}>
                            <Button icon={<FilterOutlined />} onClick={toggleShowFilter} />
                        </Tooltip>
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

            <Menu.SubMenu>
                <Menu.Item>
                    <Button icon={<PlusOutlined />}>{t('items_list.new')}</Button>
                </Menu.Item>

                <Select
                    placeholder={t('items_list.display_type')}
                    defaultValue={stateItems.displayType}
                    onChange={value => changeDisplay(value)}
                >
                    {displayOptions.map(display => (
                        <Select.Option key={display.key} value={display.value}>
                            {display.text}
                        </Select.Option>
                    ))}
                </Select>

                <Menu.Item>
                    <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()}></Button>
                </Menu.Item>
            </Menu.SubMenu>
        </Menu>
    );
}

export default MenuItemList;
