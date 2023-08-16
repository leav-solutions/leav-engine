// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {BasicButton} from '@leav/ui';
import {Popconfirm, Tooltip} from 'antd';
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
            {/* Do not remove the <></>. Workaround for issue https://github.com/ant-design/ant-design/issues/41206 */}
            <>
                <Tooltip title={t('record_edition.delete_all_values')}>
                    <BasicButton
                        aria-label="delete-all-values"
                        icon={<DeleteOutlined />}
                        shape="circle"
                        loading={isLoading}
                    />
                </Tooltip>
            </>
        </Popconfirm>
    );
}

export default DeleteAllValuesBtn;
