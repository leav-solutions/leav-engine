// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {Button, ButtonProps, Popconfirm} from 'antd';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IDeleteValueBtnProps extends ButtonProps {
    onDelete: () => void;
}

function DeleteValueBtn({onDelete, ...buttonProps}: IDeleteValueBtnProps): JSX.Element {
    const {t} = useSharedTranslation();

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
                shape="circle"
                {...buttonProps}
                icon={<DeleteOutlined />}
                style={{background: '#FFF'}}
                danger
                aria-label="delete-value"
                onClick={e => e.stopPropagation()}
                className="delete-value-button"
            />
        </Popconfirm>
    );
}

export default DeleteValueBtn;
