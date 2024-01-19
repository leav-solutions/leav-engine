// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoCircleOutlined, InfoOutlined} from '@ant-design/icons';
import {isTypeStandard} from '@leav/utils';
import {Button, ButtonProps, Tooltip} from 'antd';
import {BasicButton} from '_ui/components';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from '_ui/components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {IRecordPropertyStandard, RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';

interface IValueDetailsBtnProps extends Omit<ButtonProps, 'value'> {
    attribute: RecordFormAttributeFragment;
    value: RecordProperty;
    basic?: boolean;
}

function ValueDetailsBtn({value, attribute, basic = false, ...buttonProps}: IValueDetailsBtnProps): JSX.Element {
    const {dispatch} = useEditRecordModalReducer();
    const {t} = useSharedTranslation();

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
