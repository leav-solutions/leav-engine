import {
    type RecordFormAttributeStandardAttributeFragment,
    type StandardValuesListFragmentStandardDateRangeValuesListConfFragment,
    type StandardValuesListFragmentStandardStringValuesListConfFragment,
} from '_ui/_gqlTypes';
import {type IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type SelectProps} from 'antd';

export interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps> {
    presentationValue: string;
    attribute: RecordFormAttributeStandardAttributeFragment;
    handleSubmit: (value: string, id?: string) => Promise<void>;
}

export type IStringValuesListConf = StandardValuesListFragmentStandardStringValuesListConfFragment;
export type IDateRangeValuesListConf = StandardValuesListFragmentStandardDateRangeValuesListConfFragment;
