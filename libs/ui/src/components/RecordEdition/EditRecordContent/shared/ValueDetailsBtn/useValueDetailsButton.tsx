// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isTypeStandard} from '@leav/utils';
import {IRecordPropertyStandard, RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {AttributeType, RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';

const isIRecordPropertyStandard = (value: RecordProperty, type: AttributeType): value is IRecordPropertyStandard =>
    isTypeStandard(type);

export const useValueDetailsButton = ({
    attribute,
    value
}: {
    attribute: RecordFormAttributeFragment;
    value: RecordProperty | null;
}) => {
    const {dispatch} = useEditRecordReducer();

    const onValueDetailsButtonClick = () => {
        const editingValue = isIRecordPropertyStandard(value, attribute.type) ? value?.payload : null;
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: {
                value,
                editingValue,
                attribute
            }
        });
    };

    return {onValueDetailsButtonClick};
};
