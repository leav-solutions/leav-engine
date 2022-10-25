// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {Space} from 'antd';
import {formComponents} from 'components/RecordEdition/EditRecord/uiElements';
import StandardField from 'components/RecordEdition/EditRecord/uiElements/StandardField';
import {
    DeleteValueFunc,
    FormElement,
    ISubmitMultipleResult,
    ISubmittedValueStandard,
    MetadataSubmitValueFunc,
    SubmitValueFunc
} from 'components/RecordEdition/EditRecord/_types';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import {AttributeFormat, FormElementTypes} from '_gqlTypes/globalTypes';
import {
    RECORD_FORM_recordForm_elements_attribute,
    RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields,
    RECORD_FORM_recordForm_elements_values
} from '_gqlTypes/RECORD_FORM';

type MetadataField = RECORD_FORM_recordForm_elements_attribute_StandardAttribute_metadata_fields;

interface IValueMetadataProps {
    value: RecordProperty;
    attribute: RECORD_FORM_recordForm_elements_attribute;
    onMetadataSubmit: MetadataSubmitValueFunc;
}

const _inputTypeByFormat: {[format in AttributeFormat]: FormFieldTypes} = {
    [AttributeFormat.text]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.numeric]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.date]: FormFieldTypes.DATE,
    [AttributeFormat.boolean]: FormFieldTypes.CHECKBOX,
    [AttributeFormat.date_range]: FormFieldTypes.DATE,
    [AttributeFormat.encrypted]: FormFieldTypes.TEXT_INPUT,
    [AttributeFormat.extended]: FormFieldTypes.TEXT_INPUT
};

function ValueMetadata({value, attribute, onMetadataSubmit}: IValueMetadataProps): JSX.Element {
    const [{lang}] = useLang();

    const _handleValueSubmit: (field: MetadataField) => SubmitValueFunc = field => (
        values
    ): Promise<ISubmitMultipleResult> => {
        return onMetadataSubmit(value, attribute, {
            [field.id]: (values[0] as ISubmittedValueStandard).value
        });
    };

    const _handleValueDelete: (field: MetadataField) => DeleteValueFunc = field => (
        values
    ): Promise<ISubmitMultipleResult> => {
        return onMetadataSubmit(value, attribute, {
            [field.id]: null
        });
    };

    return (
        <Space direction="vertical" style={{width: '100%'}} size="small">
            {attribute.metadata_fields.map(field => {
                const formElement: FormElement<ICommonFieldsSettings> = {
                    id: field.id,
                    attribute: field as RECORD_FORM_recordForm_elements_attribute,
                    containerId: '__root',
                    type: FormElementTypes.field,
                    uiElementType: _inputTypeByFormat[field.format],
                    valueError: null,
                    values:
                        [
                            value?.metadata?.find(({name}) => name === field.id)
                                ?.value as RECORD_FORM_recordForm_elements_values
                        ] ?? [],
                    settings: {
                        label: localizedTranslation(field.label, lang)
                    },
                    uiElement: formComponents[_inputTypeByFormat[field.format]]
                };

                return (
                    <StandardField
                        key={`${field.id}_${value?.id_value}`}
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
