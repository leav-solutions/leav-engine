// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InfoCircleOutlined, InfoOutlined} from '@ant-design/icons';
import {Button, ButtonProps, Tooltip} from 'antd';
import {BasicButton} from '_ui/components';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';

interface IValueDetailsBtnProps extends Omit<ButtonProps, 'value'> {
    attribute: RecordFormAttributeFragment;
    value: RecordProperty;
    basic?: boolean;
}

function ValueDetailsBtn({value, attribute, basic = false, ...buttonProps}: IValueDetailsBtnProps): JSX.Element {
    const {dispatch} = useEditRecordReducer();
    const {t} = useSharedTranslation();

    const _handleClick = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute
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
