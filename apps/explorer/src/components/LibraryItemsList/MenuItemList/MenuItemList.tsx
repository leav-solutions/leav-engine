// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, RedoOutlined} from '@ant-design/icons';
import {Button, Space} from 'antd';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import {SelectionModeContext} from 'context';
import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {PrimaryBtn} from '../../app/StyledComponent/PrimaryBtn';
import DisplayOptions from '../DisplayOptions';
import MenuItemActions from '../MenuItemActions';
import MenuSelection from '../MenuSelection';
import MenuView from '../MenuView';
import SearchItems from '../SearchItems';

interface IMenuItemListProps {
    refetch?: () => void;
}

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

function MenuItemList({refetch}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();
    const [activeLibrary] = useActiveLibrary();
    const [isRecordCreationVisible, setIsRecordCreationVisible] = useState<boolean>(false);
    const canCreateRecord = activeLibrary.permissions.create_record;

    const selectionMode = useContext(SelectionModeContext);

    const _handleCreateRecord = () => {
        setIsRecordCreationVisible(true);
    };

    const _handleRecordCreationClose = () => {
        setIsRecordCreationVisible(false);
    };

    return (
        <Wrapper>
            {activeLibrary?.id && <MenuView activeLibrary={activeLibrary} />}

            <Space size="large">
                <MenuSelection />
                <SearchItems />
            </Space>

            <Space size="large">
                {!selectionMode && canCreateRecord && (
                    <PrimaryBtn icon={<PlusOutlined />} className="primary-btn" onClick={_handleCreateRecord}>
                        {t('items_list.new')}
                    </PrimaryBtn>
                )}

                <Space size="small">
                    <MenuItemActions />
                    <DisplayOptions />
                    <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()} />
                </Space>
            </Space>

            {isRecordCreationVisible && (
                <EditRecordModal
                    record={null}
                    library={activeLibrary.id}
                    open={isRecordCreationVisible}
                    onClose={_handleRecordCreationClose}
                />
            )}
        </Wrapper>
    );
}

export default MenuItemList;
