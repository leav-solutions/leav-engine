// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {Button, Popconfirm} from 'antd';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import FloatingMenu from 'components/shared/FloatingMenu';
import {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';

interface IRecordIdentityCellProps {
    record: IRecordIdentityWhoAmI;
    onDelete: (record: IRecordIdentityWhoAmI) => void;
}

const CellWrapper = styled.div`
    position: relative;

    &:not(:hover) .floating-menu {
        display: none;
    }
`;

function RecordIdentityCell({record, onDelete}: IRecordIdentityCellProps): JSX.Element {
    const {t} = useTranslation();
    const _handleDelete = () => onDelete(record);

    const menuActions: FloatingMenuAction[] = [
        {
            title: t('global.edit'),
            button: <EditRecordBtn record={record} size="small" />
        },
        {
            title: t('global.delete'),
            button: (
                <Popconfirm
                    placement="leftTop"
                    title={t('record_edition.delete_value_confirm')}
                    onConfirm={_handleDelete}
                    okText={t('global.submit')}
                    okButtonProps={{'aria-label': 'delete-confirm-btn'}}
                    cancelText={t('global.cancel')}
                >
                    <Button size="small" icon={<DeleteOutlined />} style={{background: '#FFF'}} danger />
                </Popconfirm>
            )
        }
    ];

    return (
        <CellWrapper aria-label="record-identity" data-testid="whoami-cell">
            <RecordCard record={record} size={PreviewSize.small} />
            <FloatingMenu actions={menuActions} />
        </CellWrapper>
    );
}

export default RecordIdentityCell;
