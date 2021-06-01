// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckSquareTwoTone, DeleteOutlined, DownOutlined, LogoutOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {resetSearchSelection, resetSelection, setSearchSelection, setSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {localizedLabel} from 'utils';
import {SharedStateSelectionType} from '_types/types';
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

    const selectionMode = useContext(SelectionModeContext);
    const {selectionState, items} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display,
        items: state.items
    }));
    const dispatch = useAppDispatch();

    const [{lang}] = useLang();

    const [countItemsSelected, setCountItemsSelected] = useState(0);

    const disableModeSelection = () => {
        if (selectionMode) {
            dispatch(resetSearchSelection());
        } else {
            dispatch(resetSelection());
        }
    };

    useEffect(() => {
        if (selectionMode) {
            setCountItemsSelected(selectionState.searchSelection.selected.length);
        } else {
            setCountItemsSelected(selectionState.selection.selected.length);
        }
    }, [selectionState.selection, selectionState.searchSelection, selectionMode, setCountItemsSelected]);

    const selectVisible = () => {
        let selected = [...selectionState.selection.selected];

        if (items.items) {
            for (const item of items.items) {
                selected = [
                    ...selected,
                    {
                        id: item.whoAmI.id,
                        library: item.whoAmI.library.id,
                        label: localizedLabel(item.whoAmI.label, lang)
                    }
                ];
            }
        }

        if (selectionMode) {
            dispatch(
                setSearchSelection({
                    type: SharedStateSelectionType.search,
                    selected,
                    allSelected: false
                })
            );
        } else {
            dispatch(
                setSelection({
                    type: SharedStateSelectionType.search,
                    selected,
                    allSelected: false
                })
            );
        }
    };

    const selectAll = () => {
        if (!selectionMode) {
            dispatch(
                setSelection({
                    type: SharedStateSelectionType.search,
                    selected: [],
                    allSelected: true
                })
            );
        }
    };

    const unselectAll = () => {
        if (selectionMode) {
            dispatch(resetSearchSelection());
        } else {
            dispatch(resetSelection());
        }
    };

    const allSelectActive = selectionMode
        ? selectionState.searchSelection.type === SharedStateSelectionType.search &&
          selectionState.searchSelection.allSelected
        : selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;

    return (
        <Wrapper active={active}>
            <div>
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item onClick={selectVisible}>
                                {t('items-menu-dropdown.select-visible', {nb: items.items?.length})}
                            </Menu.Item>
                            {!selectionMode && (
                                <Menu.Item onClick={selectAll}>
                                    {t('items-menu-dropdown.select-all', {nb: items.totalCount})}
                                </Menu.Item>
                            )}
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

                {!selectionMode && (
                    <>
                        <ActionsMenu />

                        <div>
                            <Button icon={<DeleteOutlined />}>{t('global.delete')}</Button>
                        </div>
                    </>
                )}

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
