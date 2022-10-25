// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {Popconfirm, Tooltip} from 'antd';
import BasicButton from 'components/shared/BasicButton';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IDeleteAllValuesBtnProps {
    onDelete: () => Promise<void>;
}

function DeleteAllValuesBtn({onDelete}: IDeleteAllValuesBtnProps): JSX.Element {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const _handleDelete = async () => {
        setIsLoading(true);
        await onDelete();
        setIsLoading(false);
    };

    return (
        <Popconfirm
            placement="leftTop"
            title={t('record_edition.delete_all_values_confirm')}
            onConfirm={_handleDelete}
            okText={t('global.submit')}
            okButtonProps={{'aria-label': 'delete-confirm-button'}}
            cancelText={t('global.cancel')}
        >
            <Tooltip title={t('record_edition.delete_all_values')}>
                <BasicButton
                    aria-label="delete-all-values"
                    icon={<DeleteOutlined />}
                    shape="circle"
                    onClick={e => e.stopPropagation()}
                    loading={isLoading}
                />
            </Tooltip>
        </Popconfirm>
    );
}

export default DeleteAllValuesBtn;
