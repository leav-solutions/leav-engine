// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckSquareTwoTone, DeleteOutlined, DownOutlined, LogoutOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import themingVars from '../../../themingVar';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';
import ActionsMenu from './ActionsMenu';

interface IMenuItemListSelectedProps {
    active: boolean;
}

interface IWrapperProps {
    active: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({active}) => (active ? 'grid' : 'none')};
    place-items: center;

    position: absolute;
    top: 0;

    width: 100%;
    background: ${themingVars['@default-bg']};
    height: 4rem;
    z-index: 11;

    animation: ${({active}) => (active ? 'moveToBottom 1s ease' : 'none')};

    & > div {
        display: grid;
        place-items: center;
        grid-template-columns: repeat(4, auto);
        column-gap: 1rem;
    }

    @keyframes moveToBottom {
        from {
            top: -100px;
        }
        to {
            top: 0;
        }
    }
`;

function MenuItemListSelected({active}: IMenuItemListSelectedProps): JSX.Element {
    const {t} = useTranslation();

    const {stateItems, dispatchItems} = useStateItem();

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
                newItemSelected[item.whoAmI.id] = true;
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
        <Wrapper active={active}>
            <div>
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item onClick={selectVisible}>
                                {t('items-menu-dropdown.select-visible', {nb: stateItems.items?.length})}
                            </Menu.Item>
                            <Menu.Item onClick={selectAll}>
                                {t('items-menu-dropdown.select-all', {nb: stateItems.itemsTotalCount})}
                            </Menu.Item>
                            <Menu.Item onClick={unselectAll}>{t('menu-selection.unselect-all')}</Menu.Item>
                        </Menu>
                    }
                >
                    <Button>
                        {stateItems.allSelected ? (
                            <>
                                <CheckSquareTwoTone /> {t('menu-selection.all-selected-enabled')}
                            </>
                        ) : (
                            t('menu-selection.nb-selected', {nb: countItemsSelected})
                        )}
                        <DownOutlined style={{paddingLeft: 12}} />
                    </Button>
                </Dropdown>

                <ActionsMenu />

                <div>
                    <Button icon={<DeleteOutlined />}>Delete</Button>
                </div>

                <div>
                    <Button icon={<LogoutOutlined />} onClick={disableModeSelection}>
                        {t('menu-selection.quit')}
                    </Button>
                </div>
            </div>
        </Wrapper>
    );
}

export default MenuItemListSelected;
