import {
    RecordFormAttributeStandardAttributeFragment,
    StandardValuesListFragmentStandardDateRangeValuesListConfFragment,
    StandardValuesListFragmentStandardStringValuesListConfFragment
} from '_ui/_gqlTypes';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';
import {SelectProps} from 'antd';

export interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeStandardAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

export type IStringValuesListConf = StandardValuesListFragmentStandardStringValuesListConfFragment;
export type IDateRangeValuesListConf = StandardValuesListFragmentStandardDateRangeValuesListConfFragment;
