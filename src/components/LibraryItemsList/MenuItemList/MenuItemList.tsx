import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dropdown, DropdownProps, Menu, Popup} from 'semantic-ui-react';
import {IItem} from '../../../_types/types';
import LibraryItemsListMenuPagination from '../LibraryItemsListMenuPagination';
import SearchItems from '../SearchItems';
import SelectView from '../SelectView';

interface IMenuItemListProps {
    showFilters: boolean;
    setShowFilters: any;
    items: IItem[] | undefined;
    setDisplay: any;
    totalCount: number;
    offset: number;
    setOffset: any;
    pagination: number;
    setModeSelection: any;
    setPagination: any;
    setSelected: any;
    setQueryFilters: any;
    refetch: any;
}

function MenuItemList({
    showFilters,
    setShowFilters,
    items,
    setDisplay,
    totalCount,
    offset,
    setOffset,
    pagination,
    setModeSelection,
    setPagination,
    setSelected,
    setQueryFilters,
    refetch
}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();

    const displayOptions = [
        {
            key: 'list',
            text: t('items_list.display-list'),
            value: 'list',
            icon: 'list layout'
        },
        {
            key: 'tile',
            text: t('items_list.display-tile'),
            value: 'tile',
            icon: 'th large',
            default: true
        }
    ];

    const changeDisplay = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newDisplay = data.value?.toString();
        if (newDisplay) {
            setDisplay(newDisplay);
        }
    };

    return (
        <>
            {!showFilters && (
                <>
                    <Menu.Item>
                        <Popup
                            content={t('items_list.show-filter-panel')}
                            trigger={<Button icon="sidebar" onClick={() => setShowFilters(show => !show)} />}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <SelectView />
                    </Menu.Item>
                </>
            )}
            <Menu.Item>
                <LibraryItemsListMenuPagination
                    items={items}
                    totalCount={totalCount}
                    offset={offset}
                    setOffset={setOffset}
                    pagination={pagination}
                    setModeSelection={setModeSelection}
                    setPagination={setPagination}
                    setSelected={setSelected}
                />
            </Menu.Item>

            <Menu.Item>
                <SearchItems setQueryFilters={setQueryFilters} />
            </Menu.Item>

            <Menu.Menu position="right">
                <Menu.Item>
                    <Button icon="plus" content={t('items_list.new')} />
                </Menu.Item>

                <Dropdown text={t('items_list.display_type')} item options={displayOptions} onChange={changeDisplay} />

                <Menu.Item>
                    <Button icon="redo" onClick={() => refetch && refetch()}></Button>
                </Menu.Item>
            </Menu.Menu>
        </>
    );
}

export default MenuItemList;
