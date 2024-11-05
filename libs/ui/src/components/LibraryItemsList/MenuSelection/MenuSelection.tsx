// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Button, Dropdown} from 'antd';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SearchMode} from '_ui/types/search';
import {SearchActionTypes} from '../hooks/useSearchReducer/searchReducer';

function MenuSelection(): JSX.Element {
    const {t} = useSharedTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const selectAll = () => {
        searchDispatch({
            type: SearchActionTypes.SELECT_ALL
        });
    };

    const selectVisible = () => {
        let selected = [...searchState.selection.selected];

        if (searchState.records) {
            for (const record of searchState.records) {
                selected = [
                    ...selected,
                    {
                        id: record.whoAmI.id,
                        library: record.whoAmI.library.id,
                        label: record.whoAmI.label
                    }
                ];
            }
        }

        searchDispatch({
            type: SearchActionTypes.SET_SELECTION,
            selected
        });
    };

    return (
        <span data-testid="dropdown-menu-selection">
            <Dropdown
                menu={{
                    items: [
                        searchState.mode !== SearchMode.select
                            ? {
                                  key: 'select_all',
                                  onClick: selectAll,
                                  label: t('items-menu-dropdown.select-all', {nb: searchState.totalCount})
                              }
                            : null,
                        {
                            key: 'select',
                            onClick: selectVisible,
                            label: t('items-menu-dropdown.select-visible', {nb: searchState.records.length})
                        }
                    ]
                }}
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
