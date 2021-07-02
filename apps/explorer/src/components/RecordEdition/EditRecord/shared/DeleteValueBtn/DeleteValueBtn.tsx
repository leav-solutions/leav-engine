// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {Button, Popconfirm} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface IDeleteValueBtnProps {
    onDelete: () => void;
}

function DeleteValueBtn({onDelete}: IDeleteValueBtnProps): JSX.Element {
    const {t} = useTranslation();

    const _handleDelete = () => onDelete();

    return (
        <Popconfirm
            placement="leftTop"
            title={t('record_edition.delete_value_confirm')}
            onConfirm={_handleDelete}
            okText={t('global.submit')}
            okButtonProps={{'aria-label': 'delete-confirm-button'}}
            cancelText={t('global.cancel')}
        >
            <Button
                size="small"
                icon={<DeleteOutlined />}
                style={{background: '#FFF'}}
                danger
                aria-label="delete-value"
            />
        </Popconfirm>
    );
}

export default DeleteValueBtn;
