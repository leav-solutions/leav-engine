// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import {useStateItem} from 'Context/StateItemsContext';
import {useLang} from 'hooks/LangHook/LangHook';
import {setSharedSelection} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {localizedLabel} from 'utils';

function MenuSelection(): JSX.Element {
    const {t} = useTranslation();
    const {stateItems} = useStateItem();
    const {stateShared, dispatchShared} = useStateShared();
    const [{lang}] = useLang();

    const offsetDisplay = stateItems.itemsTotalCount > 0 ? stateItems.offset + 1 : 0;
    const nextOffsetDisplay =
        stateItems.offset + stateItems.pagination > stateItems.itemsTotalCount
            ? stateItems.itemsTotalCount
            : stateItems.offset + stateItems.pagination;

    const selectAll = () => {
        dispatchShared(
            setSharedSelection({
                type: SharedStateSelectionType.search,
                selected: [],
                allSelected: true
            })
        );
    };
    const selectVisible = () => {
        let selected = [...stateShared.selection.selected];

        if (stateItems.items) {
            for (const item of stateItems.items) {
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

        dispatchShared(
            setSharedSelection({
                type: SharedStateSelectionType.search,
                selected,
                allSelected: false
            })
        );
    };

    return (
        <span data-testid="dropdown-menu-selection">
            <Dropdown
                overlay={
                    <Menu>
                        <Menu.Item onClick={selectAll}>
                            {t('items-menu-dropdown.select-all', {nb: stateItems.itemsTotalCount})}
                        </Menu.Item>
                        <Menu.Item onClick={selectVisible}>
                            {t('items-menu-dropdown.select-visible', {nb: stateItems.items?.length})}
                        </Menu.Item>
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
        </span>
    );
}

export default MenuSelection;
