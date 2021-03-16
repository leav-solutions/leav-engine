// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckSquareTwoTone, DeleteOutlined, DownOutlined, LogoutOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import {resetSharedSelection, setSharedSelection} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useStateItem} from '../../../Context/StateItemsContext';
import themingVars from '../../../themingVar';
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

    const {stateItems} = useStateItem();
    const {stateShared, dispatchShared} = useStateShared();

    const [countItemsSelected, setCountItemsSelected] = useState(0);

    const disableModeSelection = () => {
        dispatchShared(resetSharedSelection());
    };

    useEffect(() => {
        setCountItemsSelected(stateShared.selection.selected.length);
    }, [stateShared.selection, setCountItemsSelected]);

    const selectVisible = () => {
        let selected = [...stateShared.selection.selected];

        if (stateItems.items) {
            for (const item of stateItems.items) {
                selected = [
                    ...selected,
                    {
                        id: item.whoAmI.id,
                        library: item.whoAmI.library.id
                    }
                ];
            }
        }

        dispatchShared(
            setSharedSelection({
                type: SharedStateSelectionType.recherche,
                selected,
                allSelected: false
            })
        );
    };

    const selectAll = () => {
        // reset selected elements
        dispatchShared(
            setSharedSelection({
                type: SharedStateSelectionType.recherche,
                selected: [],
                allSelected: true
            })
        );
    };

    const unselectAll = () => {
        dispatchShared(
            setSharedSelection({
                type: SharedStateSelectionType.recherche,
                selected: [],
                allSelected: false
            })
        );
    };

    const allSelectActive =
        stateShared.selection.type === SharedStateSelectionType.recherche && stateShared.selection.allSelected;

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
                        {allSelectActive ? (
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
