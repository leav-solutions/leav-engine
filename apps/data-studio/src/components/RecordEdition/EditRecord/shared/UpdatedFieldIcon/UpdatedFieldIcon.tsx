// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';
import {useTranslation} from 'react-i18next';

function UpdatedFieldIcon(): JSX.Element {
    const {t} = useTranslation();

    return (
        <Tooltip title={t('record_edition.field_external_update')}>
            <ExclamationCircleOutlined style={{marginLeft: '5px', fontSize: '0.9em'}} />
        </Tooltip>
    );
}

export default UpdatedFieldIcon;
