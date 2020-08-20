import {DownOutlined} from '@ant-design/icons';
import {Button, Col, Dropdown, Menu, Row} from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';

interface ILibraryItemsListMenuPaginationProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
}

function LibraryItemsListMenuPagination({
    stateItems,
    dispatchItems
}: ILibraryItemsListMenuPaginationProps): JSX.Element {
    const {t} = useTranslation();

    const paginationOptions = [5, 10, 20, 50, 100];

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
                    <Menu.Item>
                        <Row>
                            <Col>
                                <Button onClick={selectAll}>
                                    {t('items-menu-dropdown.select-all', {nb: stateItems.itemsTotalCount})}
                                </Button>
                            </Col>

                            <Col>
                                <Button onClick={selectVisible}>
                                    {t('items-menu-dropdown.select-visible', {nb: stateItems.items?.length})}
                                </Button>
                            </Col>
                        </Row>
                    </Menu.Item>
                    <SubMenu title={t('items-menu-dropdown.items-display')}>
                        {paginationOptions.map(pagOption => (
                            <Menu.Item
                                key={pagOption}
                                active={stateItems.pagination === pagOption}
                                onClick={() =>
                                    dispatchItems({
                                        type: LibraryItemListReducerActionTypes.SET_PAGINATION,
                                        pagination: pagOption
                                    })
                                }
                            >
                                {pagOption}
                            </Menu.Item>
                        ))}
                    </SubMenu>
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

export default LibraryItemsListMenuPagination;
