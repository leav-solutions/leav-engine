import {Formik} from 'formik';
import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Form, Icon} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {isLinkAttribute, localizedLabel} from '../../../../utils';
import {GET_LIBRARIES_libraries_list_attributes} from '../../../../_gqlTypes/GET_LIBRARIES';
import {SAVE_VALUE_BATCH_saveValueBatch_errors} from '../../../../_gqlTypes/SAVE_VALUE_BATCH';
import {IGenericValue, ILinkValue, ITreeLinkValue, RecordData, RecordEdition} from '../../../../_types/records';
import FormFieldWrapper from '../../../shared/FormFieldWrapper';
import LinksField from '../../FormFields/LinksField';

interface ICreateRecordFormProps {
    attributes: {[attributeId: string]: GET_LIBRARIES_libraries_list_attributes};
    errors?: IEditRecordFormError;
    onSave: (values: RecordData) => void;
    setSubmitFuncRef?: RecordEdition.SetSubmitFuncRef;
    inModal?: boolean;
}

export interface IEditRecordFormError {
    [fieldName: string]: SAVE_VALUE_BATCH_saveValueBatch_errors;
}

const virginValue = {
    id_value: null,
    value: '',
    raw_value: '',
    modified_at: null,
    created_at: null,
    version: null
};

/* tslint:disable-next-line:variable-name */
const CreateRecordForm = ({
    onSave,
    attributes,
    setSubmitFuncRef,
    errors = {},
    inModal = false
}: ICreateRecordFormProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const _isAttributeReadOnly = (attribute: GET_LIBRARIES_libraries_list_attributes): boolean => {
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
            let newFieldValue;
            if (attributes[fieldName].multiple_values) {
                newFieldValue = values[fieldName].map((v, i) => {
                    const newVal = i === data['data-index'] ? value : v.value;
                    return {...v, value: newVal};
                });
            } else {
                newFieldValue = {...values[fieldName], value};
            }

            setFieldValue(fieldName, newFieldValue);
        };

        const _handleLinkChange = (fieldName: string) => (value: ILinkValue | ITreeLinkValue) => {
            // If we're on a multivalues attribute, we need to find the updated value in the array
            // Otherwise, just update value
            let newFieldValue;
            if (attributes[fieldName].multiple_values) {
                if (value.id_value) {
                    newFieldValue = values[fieldName].map(v => {
                        const newVal = v.id_value === value.id_value ? value : v;
                        return newVal;
                    });
                } else if (value.value) {
                    newFieldValue = [...values[fieldName], value];
                }
            } else {
                newFieldValue = {...values[fieldName], ...value};
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
            attr: GET_LIBRARIES_libraries_list_attributes,
            fieldValues: IGenericValue[] | IGenericValue,
            readonly: boolean
        ) => {
            const formValues = Array.isArray(fieldValues) ? fieldValues : [fieldValues];

            if (isLinkAttribute(attr, false)) {
                return (
                    <LinksField
                        values={formValues as ILinkValue[] | ITreeLinkValue[]}
                        attribute={attr}
                        onChange={_handleLinkChange(attr.id)}
                        readonly={readonly}
                    />
                );
            }

            if (!formValues.length) {
                formValues.push({...virginValue});
            }

            const attributeLabel = localizedLabel(attr.label, availableLanguages);
            const canAddValue = !readonly && (attr.multiple_values || !formValues.length);

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
                    {formValues.map((v, i) => {
                        return (
                            <Form.Input
                                key={attr.id + '_' + i}
                                name={attr.id}
                                value={v?.value || ''}
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
        allValues[attrId] = attributes[attrId].multiple_values ? [{...virginValue}] : {...virginValue};

        return allValues;
    }, {});

    return <Formik render={_renderForm} initialValues={initValues} onSubmit={onSave} enableReinitialize />;
};

export default CreateRecordForm;
