import {PlusOutlined, RedoOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconColumnChoice} from '../../../assets/icons/IconColumnChoice';
import {TypeSideItem} from '../../../_types/types';
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
    grid-column-gap: 1rem;
    align-items: center;
    justify-content: end;
`;

const SubGroupFirst = styled(SubGroup)`
    grid-template-columns: 12rem repeat(3, auto);
`;

const SubGroupLast = styled(SubGroup)`
    grid-template-columns: 10rem repeat(3, auto);
`;

function MenuItemList({stateItems, dispatchItems, refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();

    const [openChangeColumns, setOpenChangeColumns] = useState(false);

    const toggleShowFilter = () => {
        const visible =
            !stateItems.sideItems.visible || stateItems.sideItems.type !== TypeSideItem.filters ? true : false;
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SIDE_ITEMS,
            sideItems: {
                visible,
                type: TypeSideItem.filters
            }
        });
    };

    return (
        <>
            <ChooseTableColumns openChangeColumns={openChangeColumns} setOpenChangeColumns={setOpenChangeColumns} />

            <Wrapper>
                <SubGroupFirst>
                    <SelectView />

                    <Tooltip placement="bottomLeft" title={t('items_list.show-filter-panel')}>
                        <Button icon={<SearchOutlined />} name="show-filter" onClick={toggleShowFilter} />
                    </Tooltip>

                    <MenuSelection stateItems={stateItems} dispatchItems={dispatchItems} />
                </SubGroupFirst>

                <SubGroupLast>
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
                </SubGroupLast>
            </Wrapper>
        </>
    );
}

export default MenuItemList;
