import {PlusOutlined, RedoOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {PrimaryBtn} from '../../app/StyledComponent/PrimaryBtn';
import DisplayOptions from '../DisplayOptions';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import MenuSelection from '../MenuSelection';
import SelectView from '../SelectView';

interface IMenuItemListProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    refetch: any;
}

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

const SubGroup = styled.div`
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-column-gap: 1rem;
    align-items: center;
    justify-content: end;
`;

function MenuItemList({stateItems, dispatchItems, refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();

    const toggleShowFilter = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTERS,
            showFilters: !stateItems.showFilters
        });
    };

    return (
        <Wrapper>
            <SubGroup>
                <SelectView />

                <Tooltip placement="bottomLeft" title={t('items_list.show-filter-panel')}>
                    <Button icon={<SearchOutlined />} name="show-filter" onClick={toggleShowFilter} />
                </Tooltip>

                <MenuSelection stateItems={stateItems} dispatchItems={dispatchItems} />
            </SubGroup>

            <div>
                <PrimaryBtn icon={<PlusOutlined />} className="primary-btn">
                    {t('items_list.new')}
                </PrimaryBtn>
            </div>

            <SubGroup>
                <DisplayOptions />

                <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()}></Button>
            </SubGroup>
        </Wrapper>
    );
}

export default MenuItemList;
