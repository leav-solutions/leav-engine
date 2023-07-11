// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoCircleOutlined, InfoOutlined} from '@ant-design/icons';
import {BasicButton} from '@leav/ui';
import {Button, ButtonProps, Tooltip} from 'antd';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import {IRecordPropertyStandard, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useTranslation} from 'react-i18next';
import {isTypeStandard} from 'utils';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';

interface IValueDetailsBtnProps extends Omit<ButtonProps, 'value'> {
    attribute: RECORD_FORM_recordForm_elements_attribute;
    value: RecordProperty;
    basic?: boolean;
}

function ValueDetailsBtn({value, attribute, basic = false, ...buttonProps}: IValueDetailsBtnProps): JSX.Element {
    const {dispatch} = useEditRecordModalReducer();
    const {t} = useTranslation();

    const _handleClick = () => {
        const editingValue = isTypeStandard(attribute.type) ? (value as IRecordPropertyStandard)?.value : null;
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: {
                value,
                editingValue,
                attribute
            }
        });
    };

    const detailsButton = basic ? (
        <BasicButton shape="circle" {...buttonProps} icon={<InfoCircleOutlined />} onClick={_handleClick} />
    ) : (
        <Button shape="circle" {...buttonProps} icon={<InfoOutlined />} onClick={_handleClick} />
    );

    return <Tooltip title={t('record_edition.value_details_tooltip')}>{detailsButton}</Tooltip>;
}

export default ValueDetailsBtn;
