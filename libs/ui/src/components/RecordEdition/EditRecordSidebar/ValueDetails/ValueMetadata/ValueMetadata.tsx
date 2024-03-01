// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {Space} from 'antd';
import useLang from '../../../../../hooks/useLang';
import {
    AttributeFormat,
    FormElementTypes,
    RecordFormAttributeFragment,
    RecordFormQuery
} from '../../../../../_gqlTypes';
import {RecordProperty} from '../../../../../_queries/records/getRecordPropertiesQuery';
import {formComponents} from '../../../EditRecordContent/uiElements';
import StandardField from '../../../EditRecordContent/uiElements/StandardField';
import {
    DeleteValueFunc,
    FormElement,
    ISubmitMultipleResult,
    ISubmittedValueStandard,
    MetadataSubmitValueFunc,
    SubmitValueFunc
} from '../../../EditRecordContent/_types';

type MetadataField = RecordFormQuery['recordForm']['elements'][0]['attribute']['metadata_fields'][0];

interface IValueMetadataProps {
    value: RecordProperty;
    attribute: RecordFormAttributeFragment;
    onMetadataSubmit: MetadataSubmitValueFunc;
}

const _inputTypeByFormat: {[format in AttributeFormat]: FormFieldTypes} = {
    [AttributeFormat.text]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.numeric]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.date]: FormFieldTypes.DATE,
    [AttributeFormat.boolean]: FormFieldTypes.CHECKBOX,
    [AttributeFormat.date_range]: FormFieldTypes.DATE,
    [AttributeFormat.encrypted]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.extended]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.color]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.rich_text]: FormFieldTypes.TEXT_INPUT
};

function ValueMetadata({value: parentValue, attribute, onMetadataSubmit}: IValueMetadataProps): JSX.Element {
    const {lang} = useLang();

    const _handleValueSubmit: (field: MetadataField) => SubmitValueFunc = field => (
        values
    ): Promise<ISubmitMultipleResult> => {
        return onMetadataSubmit(parentValue, attribute, {
            [field.id]: (values[0] as ISubmittedValueStandard).value
        });
    };

    const _handleValueDelete: (field: MetadataField) => DeleteValueFunc = field => (
        values
    ): Promise<ISubmitMultipleResult> => {
        return onMetadataSubmit(parentValue, attribute, {
            [field.id]: null
        });
    };

    return (
        <Space direction="vertical" style={{width: '100%'}} size="small">
            {attribute.metadata_fields.map(field => {
                const formElement: FormElement<ICommonFieldsSettings> = {
                    id: field.id,
                    attribute: field as RecordFormAttributeFragment,
                    containerId: '__root',
                    type: FormElementTypes.field,
                    uiElementType: _inputTypeByFormat[field.format],
                    valueError: null,
                    values: [parentValue?.metadata?.find(({name}) => name === field.id)?.value as unknown] ?? [],
                    settings: {
                        label: localizedTranslation(field.label, lang)
                    },
                    uiElement: formComponents[_inputTypeByFormat[field.format]]
                };

                return (
                    <StandardField
                        key={`${field.id}_${parentValue?.id_value}`}
                        element={formElement}
                        onValueSubmit={_handleValueSubmit(field)}
                        onValueDelete={_handleValueDelete(field)}
                        onDeleteMultipleValues={null}
                        metadataEdit
                    />
                );
            })}
        </Space>
    );
}

export default ValueMetadata;
