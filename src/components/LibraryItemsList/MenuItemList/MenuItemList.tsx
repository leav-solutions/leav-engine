import {FilterOutlined, PlusOutlined, RedoOutlined} from '@ant-design/icons';
import {Button, Select, Tooltip} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {DisplayListItemTypes} from '../../../_types/types';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import MenuSelection from '../MenuSelection';
import SearchItems from '../SearchItems';
import SelectView from '../SelectView';

interface IMenuItemListProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    refetch: any;
}

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

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
        <Wrapper>
            {!stateItems.showFilters && (
                <>
                    <div>
                        <Tooltip placement="bottomLeft" title={t('items_list.show-filter-panel')}>
                            <Button icon={<FilterOutlined />} name="show-filter" onClick={toggleShowFilter} />
                        </Tooltip>
                    </div>
                    <div>
                        <SelectView />
                    </div>
                </>
            )}

            <div>
                <MenuSelection stateItems={stateItems} dispatchItems={dispatchItems} />
            </div>

            <div>
                <SearchItems />
            </div>

            <div>
                <Button icon={<PlusOutlined />}>{t('items_list.new')}</Button>
            </div>

            <div>
                <Select
                    placeholder={t('items_list.display_type')}
                    defaultValue={stateItems.displayType}
                    onChange={value => changeDisplay(value)}
                    bordered={false}
                >
                    {displayOptions.map(display => (
                        <Select.Option key={display.key} value={display.value}>
                            {display.text}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <div>
                <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()}></Button>
            </div>
        </Wrapper>
    );
}

export default MenuItemList;
