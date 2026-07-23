import {type AnyPrimitive} from '@leav/utils';
import {Form, type FormListFieldData} from 'antd';
import {type ReactNode} from 'react';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {AttributeFormat, type RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {DSListSelect} from './ValuesList/DSListSelect';
import {DSInputWrapper} from './DSInputWrapper';
import {DSDatePickerWrapper} from './DSDatePickerWrapper';
import {DSRangePickerWrapper} from './DSRangePickerWrapper';
import {DSInputNumberWrapper} from './DSInputNumberWrapper';
import {DSInputEncryptedWrapper} from './DSInputEncryptedWrapper';
import {DSBooleanWrapper} from './DSBooleanWrapper';
import {DSRichTextWrapper} from './DSRichTextWrapper';
import {DSColorPickerWrapper} from './DSColorPickerWrapper';
import {type CalculatedFlags, type InheritedFlags} from '../../shared/calculatedInheritedFlags';

interface IStandardFieldValueProps {
    presentationValue: string;
    handleSubmit: (value: AnyPrimitive | null) => Promise<void | ISubmitMultipleResult>;
    attribute: RecordFormAttributeStandardAttributeFragment;
    label: string;
    readonly: boolean;
    calculatedFlags: CalculatedFlags;
    inheritedFlags: InheritedFlags;
    listField?: FormListFieldData;
    removeLastValueOfMultivalues?: () => void;
    isLastValueOfMultivalues?: boolean;
}

function StandardFieldValue({
    presentationValue,
    handleSubmit,
    attribute,
    label,
    readonly,
    calculatedFlags,
    inheritedFlags,
    listField,
    removeLastValueOfMultivalues,
    isLastValueOfMultivalues = false,
}: IStandardFieldValueProps): JSX.Element {
    const isValuesListEnabled = !!attribute?.values_list?.enable;

    const attributeFormatsWithDS = [
        AttributeFormat.text,
        AttributeFormat.date_range,
        AttributeFormat.numeric,
        AttributeFormat.encrypted,
        AttributeFormat.date,
        AttributeFormat.boolean,
        AttributeFormat.rich_text,
        AttributeFormat.color,
        AttributeFormat.extended,
    ];

    const commonProps = {
        handleSubmit,
        attribute,
        presentationValue,
        isLastValueOfMultivalues,
        removeLastValueOfMultivalues,
        readonly,
        label,
        calculatedFlags,
        inheritedFlags,
    };

    let valueContent: ReactNode;
    if (isValuesListEnabled) {
        valueContent = <DSListSelect {...commonProps} />;
    } else {
        switch (attribute.format) {
            case AttributeFormat.text:
            case AttributeFormat.extended:
                valueContent = <DSInputWrapper {...commonProps} />;
                break;
            case AttributeFormat.date:
                valueContent = <DSDatePickerWrapper {...commonProps} />;
                break;
            case AttributeFormat.date_range:
                valueContent = <DSRangePickerWrapper {...commonProps} />;
                break;
            case AttributeFormat.numeric:
                valueContent = <DSInputNumberWrapper {...commonProps} />;
                break;
            case AttributeFormat.encrypted:
                valueContent = <DSInputEncryptedWrapper {...commonProps} />;
                break;
            case AttributeFormat.boolean:
                valueContent = <DSBooleanWrapper {...commonProps} />;
                break;
            case AttributeFormat.rich_text:
                valueContent = <DSRichTextWrapper {...commonProps} />;
                break;
            case AttributeFormat.color:
                valueContent = <DSColorPickerWrapper {...commonProps} />;
        }
    }

    // React 18.3 warns when a spread props object carries `key` — antd's FormListFieldData does.
    const {key: listFieldKey, ...listFieldRest} = listField ?? {};

    return (
        attributeFormatsWithDS.includes(attribute.format) && (
            <Form.Item key={listFieldKey} name={attribute.id} {...listFieldRest} noStyle>
                {valueContent}
            </Form.Item>
        )
    );
}

export default StandardFieldValue;
