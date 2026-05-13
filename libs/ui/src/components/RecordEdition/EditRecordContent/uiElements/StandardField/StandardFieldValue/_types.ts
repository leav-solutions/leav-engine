import {type RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {
    type IProvidedByAntFormItem,
    type ISubmitMultipleResult,
    type StandardValueTypes,
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type CalculatedFlags, type InheritedFlags} from '../../shared/calculatedInheritedFlags';

export interface IStandFieldValueContentProps<T> extends IProvidedByAntFormItem<T> {
    presentationValue?: string;
    attribute?: RecordFormAttributeStandardAttributeFragment;
    label?: string;
    isLastValueOfMultivalues?: boolean;
    removeLastValueOfMultivalues?: () => void;
    handleSubmit: (value: StandardValueTypes, id?: string) => Promise<void | ISubmitMultipleResult>;
    readonly: boolean;
    calculatedFlags: CalculatedFlags;
    inheritedFlags: InheritedFlags;
}
