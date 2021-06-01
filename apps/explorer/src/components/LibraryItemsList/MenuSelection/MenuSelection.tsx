// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {setSearchSelection, setSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {localizedLabel} from 'utils';
import {SharedStateSelectionType} from '_types/types';

function MenuSelection(): JSX.Element {
    const {t} = useTranslation();

    const selectionMode = useContext(SelectionModeContext);

    const {items, selectionState, display} = useAppSelector(state => ({
        items: state.items,
        selectionState: state.selection,
        display: state.display
    }));
    const dispatch = useAppDispatch();
    const [{lang}] = useLang();

    const offsetDisplay = items.totalCount > 0 ? items.offset + 1 : 0;
    const nextOffsetDisplay =
        items.offset + items.pagination > items.totalCount ? items.totalCount : items.offset + items.pagination;

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

    return (
        <span data-testid="dropdown-menu-selection">
            <Dropdown
                overlay={
                    <Menu>
                        {!selectionMode && (
                            <Menu.Item onClick={selectAll}>
                                {t('items-menu-dropdown.select-all', {nb: items.totalCount})}
                            </Menu.Item>
                        )}
                        <Menu.Item onClick={selectVisible}>
                            {t('items-menu-dropdown.select-visible', {nb: items.items?.length})}
                        </Menu.Item>
                    </Menu>
                }
            >
                <span>
                    {t('items-list-row.nb-elements', {
                        nb1: offsetDisplay,
                        nb2: nextOffsetDisplay,
                        nbItems: items.totalCount
                    })}
                    <DownOutlined style={{paddingLeft: 6}} />
                </span>
            </Dropdown>
        </span>
    );
}

export default MenuSelection;
