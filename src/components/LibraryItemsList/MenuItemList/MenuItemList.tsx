import {PlusOutlined, RedoOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconClosePanel} from '../../../assets/icons/IconClosePanel';
import {IconOpenPanel} from '../../../assets/icons/IconOpenPanel';
import {TypeSideItem} from '../../../_types/types';
import {PrimaryBtn} from '../../app/StyledComponent/PrimaryBtn';
import DisplayOptions from '../DisplayOptions';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../LibraryItemsListReducer';
import MenuItemActions from '../MenuItemActions';
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
    grid-template-columns: repeat(5, auto);
`;

const SubGroupLast = styled(SubGroup)`
    grid-template-columns: 10rem repeat(3, auto);
`;

function MenuItemList({stateItems, dispatchItems, refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();

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

    const handleHide = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SIDE_ITEMS,
            sideItems: {
                visible: !stateItems.sideItems.visible,
                type: stateItems.sideItems.type || TypeSideItem.filters
            }
        });
    };

    const panelActive = stateItems.sideItems.visible;

    return (
        <Wrapper>
            <SubGroupFirst>
                <Button icon={panelActive ? <IconClosePanel /> : <IconOpenPanel />} onClick={handleHide} />

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

                <MenuItemActions />
                <DisplayOptions />

                <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()}></Button>
            </SubGroupLast>
        </Wrapper>
    );
}

export default MenuItemList;
