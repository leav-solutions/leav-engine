// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import {SelectionModeContext} from 'context';
import {useLang} from 'hooks/LangHook/LangHook';
import useSearchReducer from 'hooks/useSearchReducer';
import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {setSearchSelection, setSelection} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {localizedTranslation} from 'utils';
import {SharedStateSelectionType} from '_types/types';

function MenuSelection(): JSX.Element {
    const {t} = useTranslation();

    const selectionMode = useContext(SelectionModeContext);

    const {state: searchState} = useSearchReducer();
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));
    const dispatch = useAppDispatch();
    const [{lang}] = useLang();

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

        if (searchState.records) {
            for (const record of searchState.records) {
                selected = [
                    ...selected,
                    {
                        id: record.whoAmI.id,
                        library: record.whoAmI.library.id,
                        label: localizedTranslation(record.whoAmI.label, lang)
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
                    <Menu
                        items={[
                            !selectionMode
                                ? {
                                      key: 'select',
                                      onClick: selectAll,
                                      label: t('items-menu-dropdown.select-all', {nb: searchState.totalCount})
                                  }
                                : null,
                            {
                                key: 'select',
                                onClick: selectVisible,
                                label: t('items-menu-dropdown.select-visible', {nb: searchState.records.length})
                            }
                        ]}
                    ></Menu>
                }
            >
                <Button icon={<DownOutlined />}>
                    {t('items-list-row.nb-elements', {
                        nbItems: searchState.totalCount
                    })}
                </Button>
            </Dropdown>
        </span>
    );
}

export default MenuSelection;
