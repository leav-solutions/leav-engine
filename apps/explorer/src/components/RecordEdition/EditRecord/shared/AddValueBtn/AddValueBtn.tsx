// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {ButtonProps} from 'antd';
import BasicButton from 'components/shared/BasicButton';
import {useTranslation} from 'react-i18next';

interface IAddValueBtnProps extends ButtonProps {
    bordered?: boolean;
    linkField?: boolean;
}

function AddValueBtn({bordered = false, linkField = false, ...props}: IAddValueBtnProps): JSX.Element {
    const {t} = useTranslation();
    return (
        <BasicButton bordered={bordered} {...props}>
            <PlusOutlined />
            {linkField ? t('record_edition.add_value_link') : t('record_edition.add_value')}
        </BasicButton>
    );
}

export default AddValueBtn;
