// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

function UpdatedFieldIcon(): JSX.Element {
    const {t} = useSharedTranslation();

    return (
        <Tooltip title={t('record_edition.field_external_update')}>
            <ExclamationCircleOutlined style={{marginLeft: '5px', fontSize: '0.9em'}} />
        </Tooltip>
    );
}

export default UpdatedFieldIcon;
