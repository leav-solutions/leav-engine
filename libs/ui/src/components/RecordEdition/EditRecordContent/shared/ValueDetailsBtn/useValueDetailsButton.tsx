import {isTypeStandard} from '@leav/utils';
import {IRecordPropertyStandard, RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {Tooltip} from 'antd';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {InfoOutlined} from '@ant-design/icons';

interface IUseValueDetailsButtonProps {
    attribute: RecordFormAttributeFragment;
    value: RecordProperty;
}

export const useValueDetailsButton = ({attribute, value}: IUseValueDetailsButtonProps) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useEditRecordReducer();

    const onValueDetailsButtonClick = () => {
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

    const infoIconWithTooltip = (
        <Tooltip title={t('record_edition.value_details_tooltip')}>
            <InfoOutlined />
        </Tooltip>
    );

    return {onValueDetailsButtonClick, infoIconWithTooltip};
};
