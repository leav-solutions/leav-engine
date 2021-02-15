// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, RedoOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconClosePanel} from '../../../assets/icons/IconClosePanel';
import {IconOpenPanel} from '../../../assets/icons/IconOpenPanel';
import {useStateItem} from '../../../Context/StateItemsContext';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {TypeSideItem} from '../../../_types/types';
import {PrimaryBtn} from '../../app/StyledComponent/PrimaryBtn';
import DisplayOptions from '../DisplayOptions';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';
import MenuItemActions from '../MenuItemActions';
import MenuSelection from '../MenuSelection';
import SelectView from '../SelectView';

interface IMenuItemListProps {
    refetch?: () => void;
}

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

const SubGroup = styled.div`
    display: grid;
    grid-column-gap: 2rem;
    align-items: center;
    justify-content: end;
`;

const SubGroupFirst = styled(SubGroup)`
    grid-template-columns: repeat(5, auto);
    column-gap: calc(2rem + 1px); ;
`;

const SubGroupLast = styled(SubGroup)`
    grid-template-columns: 10rem repeat(3, auto);
`;

function MenuItemList({refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();
    const [activeLibrary] = useActiveLibrary();
    const {stateItems, dispatchItems} = useStateItem();

    const toggleShowFilter = () => {
        const visible = !stateItems.sideItems.visible || stateItems.sideItems.type !== TypeSideItem.filters;
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

                {activeLibrary?.id && <SelectView />}

                <Tooltip placement="bottomLeft" title={t('items_list.show-filter-panel')}>
                    <Button icon={<SearchOutlined />} role="show-filter" onClick={toggleShowFilter} />
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

                <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()} />
            </SubGroupLast>
        </Wrapper>
    );
}

export default MenuItemList;
