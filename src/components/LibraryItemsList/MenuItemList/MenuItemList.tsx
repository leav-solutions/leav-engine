import {PlusOutlined, RedoOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconColumnChoice} from '../../../assets/icons/IconColumnChoice';
import {PrimaryBtn} from '../../app/StyledComponent/PrimaryBtn';
import DisplayOptions from '../DisplayOptions';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import ChooseTableColumns from '../LibraryItemsListTable/ChooseTableColumns';
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
    grid-template-columns: 10rem repeat(3, auto);
    grid-column-gap: 1rem;
    align-items: center;
    justify-content: end;
`;

function MenuItemList({stateItems, dispatchItems, refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();

    const [openChangeColumns, setOpenChangeColumns] = useState(false);

    const toggleShowFilter = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SHOW_FILTERS,
            showFilters: !stateItems.showFilters
        });
    };

    return (
        <>
            <ChooseTableColumns openChangeColumns={openChangeColumns} setOpenChangeColumns={setOpenChangeColumns} />

            <Wrapper>
                <SubGroup>
                    <SelectView />

                    <Tooltip placement="bottomLeft" title={t('items_list.show-filter-panel')}>
                        <Button icon={<SearchOutlined />} name="show-filter" onClick={toggleShowFilter} />
                    </Tooltip>

                    <MenuSelection stateItems={stateItems} dispatchItems={dispatchItems} />
                </SubGroup>

                <SubGroup>
                    <div>
                        <PrimaryBtn icon={<PlusOutlined />} className="primary-btn">
                            {t('items_list.new')}
                        </PrimaryBtn>
                    </div>

                    <Tooltip title={t('items_list.table.header-cell-menu.choose-columns')} placement="bottom">
                        <Button
                            icon={<IconColumnChoice />}
                            name="show-change-column"
                            onClick={() => setOpenChangeColumns(true)}
                        />
                    </Tooltip>

                    <DisplayOptions />

                    <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()}></Button>
                </SubGroup>
            </Wrapper>
        </>
    );
}

export default MenuItemList;
