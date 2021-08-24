// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, RedoOutlined, SearchOutlined} from '@ant-design/icons';
import {Button, Tooltip} from 'antd';
import {SelectionModeContext} from 'context';
import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {setDisplaySide} from 'redux/display';
import {addNotification} from 'redux/notifications';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {IconClosePanel} from '../../../assets/icons/IconClosePanel';
import {IconOpenPanel} from '../../../assets/icons/IconOpenPanel';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {NotificationChannel, NotificationType, TypeSideItem} from '../../../_types/types';
import {PrimaryBtn} from '../../app/StyledComponent/PrimaryBtn';
import DisplayOptions from '../DisplayOptions';
import MenuItemActions from '../MenuItemActions';
import MenuSelection from '../MenuSelection';
import MenuView from '../MenuView';

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

    const selectionMode = useContext(SelectionModeContext);
    const {display} = useAppSelector(state => state);
    const dispatch = useAppDispatch();

    const toggleShowFilter = () => {
        const visible = !display.side.visible || display.side.type !== TypeSideItem.filters;

        dispatch(
            setDisplaySide({
                visible,
                type: TypeSideItem.filters
            })
        );
    };

    const handleHide = () => {
        dispatch(
            setDisplaySide({
                visible: !display.side.visible,
                type: display.side.type || TypeSideItem.filters
            })
        );
    };

    const handleNew = () => {
        dispatch(
            addNotification({
                content: t('items_list.actions.new'),
                type: NotificationType.warning,
                channel: NotificationChannel.trigger
            })
        );
    };

    const panelActive = display.side.visible;

    return (
        <Wrapper>
            <SubGroupFirst>
                <Button icon={panelActive ? <IconClosePanel /> : <IconOpenPanel />} onClick={handleHide} />

                {activeLibrary?.id && <MenuView activeLibrary={activeLibrary} />}

                <Tooltip placement="bottomLeft" title={t('items_list.show-filter-panel')}>
                    <Button icon={<SearchOutlined />} role="show-filter" onClick={toggleShowFilter} />
                </Tooltip>

                <MenuSelection />
            </SubGroupFirst>

            <SubGroupLast>
                <div>
                    {!selectionMode && (
                        <PrimaryBtn icon={<PlusOutlined />} className="primary-btn" onClick={handleNew}>
                            {t('items_list.new')}
                        </PrimaryBtn>
                    )}
                </div>

                <MenuItemActions />
                <DisplayOptions />

                <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()} />
            </SubGroupLast>
        </Wrapper>
    );
}

export default MenuItemList;
