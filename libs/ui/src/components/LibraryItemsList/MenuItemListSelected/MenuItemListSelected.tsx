// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017kn
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, DownOutlined} from '@ant-design/icons';
import {Button, Dropdown} from 'antd';
import uniqBy from 'lodash/uniqBy';
import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SearchMode} from '_ui/types/search';
import {SearchActionTypes} from '../hooks/useSearchReducer/searchReducer';
import ActionsMenu from './ActionsMenu';

interface IMenuItemListSelectedProps {
    active: boolean;
}

interface IWrapperProps {
    $active: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    display: ${({$active}) => ($active ? 'grid' : 'none')};
    place-items: center;

    position: absolute;
    top: 0;

    width: 100%;
    background: ${themeVars.defaultBg};
    height: 4rem;
    z-index: 11;

    animation: ${({$active}) => ($active ? 'moveToBottom .3s ease' : 'none')};

    & > div {
        display: grid;
        place-items: center;
        grid-template-columns: repeat(4, auto);
        column-gap: 1rem;
    }

    @keyframes moveToBottom {
        from {
            top: -105px;
        }
        to {
            top: 0;
        }
    }
`;

const DropdownButton = styled.div`
    && {
        display: flex;
        padding: 0;
    }
`;

const SelectionSummary = styled(Button)`
    && {
        padding: 0 1em;
        display: flex;
        align-items: center;
        border-right-color: transparent;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
`;

const ClearSelection = styled(Button)`
    && {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        display: flex;
        padding: 0 1em;
        align-items: center;
    }
`;

function MenuItemListSelected({active}: IMenuItemListSelectedProps): JSX.Element {
    const {t} = useSharedTranslation();

    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();

    const [countItemsSelected, setCountItemsSelected] = useState(0);

    const disableModeSelection = () => {
        searchDispatch({
            type: SearchActionTypes.CLEAR_SELECTION
        });
    };

    useEffect(() => {
        setCountItemsSelected(searchState.selection.selected.length);
    }, [searchState.selection]);

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
        selected = uniqBy(selected, item => `${item.id}_${item.library}`);

        searchDispatch({
            type: SearchActionTypes.SET_SELECTION,
            selected
        });
    };

    const selectAll = () => {
        searchDispatch({
            type: SearchActionTypes.SELECT_ALL
        });
    };

    const unselectAll = () => {
        searchDispatch({
            type: SearchActionTypes.CLEAR_SELECTION
        });
    };

    const allSelectActive = searchState.selection.allSelected;

    return (
        <Wrapper $active={active}>
            <div>
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'select-visible',
                                onClick: selectVisible,
                                label: t('items-menu-dropdown.select-visible', {nb: searchState.records.length})
                            },
                            searchState.mode !== SearchMode.select
                                ? {
                                      key: 'select-all',
                                      onClick: selectAll,
                                      label: t('items-menu-dropdown.select-all', {nb: searchState.totalCount})
                                  }
                                : null,
                            {key: 'unselect-all', onClick: unselectAll, label: t('menu-selection.unselect-all')}
                        ]
                    }}
                >
                    <DropdownButton>
                        <SelectionSummary>
                            {t('menu-selection.nb-selected', {
                                nbSelected: !allSelectActive ? countItemsSelected : searchState.totalCount,
                                total: searchState.totalCount
                            })}
                            <DownOutlined style={{paddingLeft: 12}} />
                        </SelectionSummary>
                        <ClearSelection onClick={disableModeSelection}>
                            <CloseOutlined />
                        </ClearSelection>
                    </DropdownButton>
                </Dropdown>

                {searchState.mode !== SearchMode.select && <ActionsMenu />}
            </div>
        </Wrapper>
    );
}

export default MenuItemListSelected;
