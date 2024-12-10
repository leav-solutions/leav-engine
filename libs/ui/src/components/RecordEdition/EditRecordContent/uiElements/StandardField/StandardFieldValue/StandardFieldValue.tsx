// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive} from '@leav/utils';
import {Form, FormListFieldData} from 'antd';
import {ReactNode} from 'react';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeFormat, RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {MonoValueSelect} from './ValuesList/MonoValueSelect';
import {DSInputWrapper} from './DSInputWrapper';
import {DSDatePickerWrapper} from './DSDatePickerWrapper';
import {DSRangePickerWrapper} from './DSRangePickerWrapper';
import {DSInputNumberWrapper} from './DSInputNumberWrapper';
import {DSInputEncryptedWrapper} from './DSInputEncryptedWrapper';
import {DSBooleanWrapper} from './DSBooleanWrapper';
import {DSRichTextWrapper} from './DSRichTextWrapper';
import {DSColorPickerWrapper} from './DSColorPickerWrapper';
import {CalculatedFlags, InheritedFlags} from '../calculatedInheritedFlags';

interface IStandardFieldValueProps {
    presentationValue: string | string[];
    handleSubmit: (value: AnyPrimitive | null) => Promise<void | ISubmitMultipleResult>;
    handleDeselect?: (value: AnyPrimitive | null) => Promise<void>;
    handleDeleteAllValues?: () => Promise<void>;
    attribute: RecordFormAttributeStandardAttributeFragment;
    label: string;
    listField?: FormListFieldData;
    required: boolean;
    readonly: boolean;
    calculatedFlags: CalculatedFlags;
    inheritedFlags: InheritedFlags;
}

function StandardFieldValue({
    presentationValue,
    handleSubmit,
    handleDeselect,
    handleDeleteAllValues,
    attribute,
    label,
    listField,
    required,
    readonly,
    calculatedFlags,
    inheritedFlags
}: IStandardFieldValueProps): JSX.Element {
    const {t} = useSharedTranslation();

    const isValuesListEnabled = !!attribute?.values_list?.enable;

    const attributeFormatsWithDS = [
        AttributeFormat.text,
        AttributeFormat.date_range,
        AttributeFormat.numeric,
        AttributeFormat.encrypted,
        AttributeFormat.date,
        AttributeFormat.boolean,
        AttributeFormat.rich_text,
        AttributeFormat.color
    ];

    const commonProps = {
        handleSubmit,
        handleDeselect,
        handleDeleteAllValues,
        attribute,
        presentationValue,
        readonly,
        label,
        required,
        calculatedFlags,
        inheritedFlags
    };

    let valueContent: ReactNode;
    if (isValuesListEnabled) {
        valueContent = <MonoValueSelect {...commonProps} />;
    } else {
        switch (attribute.format) {
            case AttributeFormat.text:
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

    return (
        attributeFormatsWithDS.includes(attribute.format) && (
            <Form.Item
                name={attribute.id}
                {...listField}
                rules={
                    //TODO: Remove this rule when required is implemented in the backend
                    !attribute.multiple_values
                        ? [
                              {
                                  required,
                                  message: t('errors.standard_field_required')
                              }
                          ]
                        : undefined
                }
                noStyle
            >
                {valueContent}
            </Form.Item>
        )
    );
}

export default StandardFieldValue;
