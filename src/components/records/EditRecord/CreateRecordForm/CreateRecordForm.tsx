// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Formik} from 'formik';
import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Icon} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {isLinkAttribute, isValueNull, localizedLabel} from '../../../../utils';
import {GET_LIB_BY_ID_libraries_list_attributes} from '../../../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeType} from '../../../../_gqlTypes/globalTypes';
import {SAVE_VALUE_BATCH_saveValueBatch_errors} from '../../../../_gqlTypes/SAVE_VALUE_BATCH';
import {IGenericValue, ILinkValue, ITreeLinkValue, IValue, RecordData, RecordEdition} from '../../../../_types/records';
import FormFieldWrapper from '../../../shared/FormFieldWrapper';
import LinksField from '../../FormFields/LinksField';

interface ICreateRecordFormProps {
    attributes: {[attributeId: string]: GET_LIB_BY_ID_libraries_list_attributes};
    errors?: IEditRecordFormError;
    onSave: (values: RecordData) => void;
    setSubmitFuncRef?: RecordEdition.SetSubmitFuncRef;
    inModal?: boolean;
}

export interface IEditRecordFormError {
    [fieldName: string]: SAVE_VALUE_BATCH_saveValueBatch_errors;
}

const _getVirginValue = (attribute): IValue | ILinkValue | ITreeLinkValue => {
    const baseValue: IGenericValue = {
        id_value: null,
        modified_at: null,
        created_at: null,
        version: null
    };

    switch (attribute.type) {
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
            return {...baseValue, linkValue: null};
        case AttributeType.tree:
            return {...baseValue, treeValue: null};
        default:
            return {...baseValue, value: null, raw_value: null};
    }
};

const CreateRecordForm = ({
    onSave,
    attributes,
    setSubmitFuncRef,
    errors = {},
    inModal = false
}: ICreateRecordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const _isAttributeReadOnly = (attribute: GET_LIB_BY_ID_libraries_list_attributes): boolean => {
        return attribute.system;
    };

    const submitRef = useRef<RecordEdition.SubmitFunc | null>(null);
    useEffect(() => {
        if (!!setSubmitFuncRef) {
            setSubmitFuncRef(submitRef);
        }
    }, [setSubmitFuncRef]);

    const _renderForm = ({values, handleSubmit, setFieldValue}) => {
        const _handleChange = (e, data) => {
            const value = data.type === 'checkbox' ? data.checked : data.value;
            const fieldName: string = data.name;

            // If we're on a multivalues attribute, we need to find the updated value in the array
            // Otherwise, just update value
            const newFieldValue = values[fieldName].map((v, i) => {
                const newVal = i === data['data-index'] ? value : v.value;
                return {...v, value: newVal};
            });

            setFieldValue(fieldName, newFieldValue);
        };

        const _handleLinkChange = (fieldName: string) => (value: ILinkValue | ITreeLinkValue, index) => {
            let newFieldValue;
            if (isValueNull(value)) {
                // Delete value
                newFieldValue = [...values[fieldName]];
                newFieldValue = [...newFieldValue.slice(0, index), ...newFieldValue.slice(index + 1)];
            } else {
                // Add value
                newFieldValue = [...values[fieldName], value];
            }

            setFieldValue(fieldName, newFieldValue);
        };

        const _addValue = fieldName => () => {
            const newFieldValues = values[fieldName].map(v => ({...v}));
            newFieldValues.push({
                value: '',
                id_value: null
            });

            setFieldValue(fieldName, newFieldValues);
        };

        const _renderValueField = (
            attr: GET_LIB_BY_ID_libraries_list_attributes,
            fieldValues: IGenericValue[],
            readonly: boolean
        ) => {
            if (isLinkAttribute(attr, false)) {
                return (
                    <LinksField
                        values={fieldValues as ILinkValue[] | ITreeLinkValue[]}
                        attribute={attr}
                        onChange={_handleLinkChange(attr.id)}
                        readonly={readonly}
                    />
                );
            }

            if (!fieldValues.length) {
                fieldValues.push({..._getVirginValue(attr)});
            }

            const attributeLabel = localizedLabel(attr.label, availableLanguages);
            const canAddValue = !readonly && (attr.multiple_values || !fieldValues.length);

            return (
                <>
                    <label style={{display: 'inline'}}>{attributeLabel}</label>
                    {canAddValue && (
                        <Button
                            type="button"
                            size="mini"
                            compact
                            basic
                            icon
                            labelPosition="right"
                            style={{margin: '5px'}}
                            onClick={_addValue(attr.id)}
                            data-test-id="add_value_btn"
                        >
                            <Icon name="plus" />
                            {t('records.add_value')}
                        </Button>
                    )}
                    {fieldValues.map((v, i) => {
                        return (
                            <Form.Input
                                key={attr.id + '_' + i}
                                name={attr.id}
                                value={(v as IValue)?.value || ''}
                                data-index={i}
                                onChange={_handleChange}
                                disabled={readonly}
                            />
                        );
                    })}
                </>
            );
        };

        submitRef.current = handleSubmit;

        return (
            <Form onSubmit={handleSubmit}>
                {Object.keys(attributes).map(attrId => (
                    <FormFieldWrapper key={attrId} error={(errors[attrId] && errors[attrId].message) || ''}>
                        {_renderValueField(
                            attributes[attrId],
                            values[attrId],
                            _isAttributeReadOnly(attributes[attrId])
                        )}
                    </FormFieldWrapper>
                ))}
                {!inModal && (
                    <Form.Group>
                        <Form.Button type="submit" positive>
                            <Icon name="checkmark" /> {t('admin.submit')}
                        </Form.Button>
                    </Form.Group>
                )}
            </Form>
        );
    };

    const initValues = Object.keys(attributes).reduce((allValues, attrId) => {
        allValues[attrId] = [{..._getVirginValue(attributes[attrId])}];

        return allValues;
    }, {});

    return <Formik render={_renderForm} initialValues={initValues} onSubmit={onSave} enableReinitialize />;
};

export default CreateRecordForm;
