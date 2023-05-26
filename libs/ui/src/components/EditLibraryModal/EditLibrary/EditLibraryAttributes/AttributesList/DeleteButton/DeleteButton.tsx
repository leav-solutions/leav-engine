// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Button, message, Popconfirm} from 'antd';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LibraryAttributesFragment} from '../../../../../../_gqlTypes';

interface IDeleteButtonProps {
    attribute: LibraryAttributesFragment;
    readOnly: boolean;
    onDelete: (attribute: LibraryAttributesFragment) => Promise<void>;
}

function DeleteButton({attribute, readOnly, onDelete}: IDeleteButtonProps): JSX.Element {
    const {t} = useTranslation('shared');
    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = readOnly || attribute.system;

    const _handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onDelete(attribute);
        } catch (e) {
            message.error(e.message);
        }
        setIsLoading(false);
    };

    return (
        <Popconfirm
            title={t('attributes.delete_confirm')}
            onConfirm={_handleConfirm}
            okText={t('global.submit')}
            cancelText={t('global.cancel')}
            okButtonProps={{loading: isLoading}}
            disabled={isDisabled}
        >
            <Button
                aria-label="delete"
                size="small"
                shape="circle"
                style={{border: 'none', boxShadow: 'none'}}
                icon={<CloseOutlined />}
                disabled={isDisabled}
            />
        </Popconfirm>
    );
}

export default DeleteButton;
