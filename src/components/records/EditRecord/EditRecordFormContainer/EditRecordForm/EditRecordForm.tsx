import {Formik} from 'formik';
import React, {useEffect, useRef} from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Button, Form, Icon} from 'semantic-ui-react';
import {isLinkAttribute, localizedLabel} from '../../../../../utils/utils';
import {GET_LIBRARIES_libraries_list_attributes} from '../../../../../_gqlTypes/GET_LIBRARIES';
import {SAVE_VALUE_BATCH_saveValueBatch_errors} from '../../../../../_gqlTypes/SAVE_VALUE_BATCH';
import {
    IGenericValue,
    ILinkValue,
    ITreeLinkValue,
    IValue,
    RecordData,
    RecordEdition
} from '../../../../../_types/records';
import FormFieldWrapper from '../../../../shared/FormFieldWrapper';
import EditRecordFormLinks from './EditRecordFormLinks';

interface IEditRecordFormProps extends WithNamespaces {
    attributes: GET_LIBRARIES_libraries_list_attributes[];
    recordData: RecordData;
    errors?: IEditRecordFormError;
    onSave: (values: RecordData) => void;
    setSubmitFuncRef?: RecordEdition.SetSubmitFuncRef;
    inModal?: boolean;
}

export interface IEditRecordFormError {
    [fieldName: string]: SAVE_VALUE_BATCH_saveValueBatch_errors;
}

function EditRecordForm({
    onSave,
    attributes,
    recordData,
    t,
    i18n,
    setSubmitFuncRef,
    errors = {},
    inModal = false
}: IEditRecordFormProps): JSX.Element {
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
            const name: string = data.name;

            // If we're on a multivalues attribute, we need to find the updated value in the array
            // Otherwise, just update value
            let newFieldValue;
            if (Array.isArray(values[name])) {
                newFieldValue = values[name].map((v, i) => {
                    const newVal = i === data['data-index'] ? value : v.value;
                    return {...v, value: newVal};
                });
            } else {
                newFieldValue = {...values[name], value};
            }

            setFieldValue(name, newFieldValue);
        };

        const _handleLinkChange = (fieldName: string) => (value: ILinkValue | ITreeLinkValue) => {
            // If we're on a multivalues attribute, we need to find the updated value in the array
            // Otherwise, just update value
            let newFieldValue;
            if (Array.isArray(values[fieldName])) {
                if (value.id_value) {
                    newFieldValue = values[fieldName].map(v => {
                        const newVal = v.id_value === value.id_value ? value : v;
                        return newVal;
                    });
                } else if (value.value) {
                    newFieldValue = [...values[fieldName], value];
                }
            } else {
                newFieldValue = {...values[fieldName], value};
            }

            setFieldValue(fieldName, newFieldValue);
        };

        const _addValue = name => () => {
            if (!Array.isArray(values[name])) {
                return;
            }

            const newFieldValues = values[name].map(v => ({...v}));
            newFieldValues.push({
                value: '',
                id_value: null
            });

            setFieldValue(name, newFieldValues);
        };

        const _renderValueField = (
            attr: GET_LIBRARIES_libraries_list_attributes,
            fieldValues: IGenericValue[] | IGenericValue,
            readOnly: boolean
        ) => {
            if (isLinkAttribute(attr, false)) {
                return (
                    <EditRecordFormLinks
                        values={fieldValues as (ILinkValue | ILinkValue[])}
                        attribute={attr}
                        onChange={_handleLinkChange(attr.id)}
                        readOnly={readOnly}
                    />
                );
            }

            const _renderInput = (label, idValue, valueContent, index = 0) => (
                <Form.Input
                    key={attr.id}
                    name={attr.id}
                    label={label}
                    value={valueContent || ''}
                    data-id-value={idValue}
                    data-index={index}
                    onChange={_handleChange}
                    disabled={readOnly}
                />
            );

            const attributeLabel = localizedLabel(attr.label, i18n);

            if (!readOnly && fieldValues && Array.isArray(fieldValues)) {
                const fieldLabel = (
                    <>
                        <label style={{display: 'inline'}}>{attributeLabel}</label>
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
                    </>
                );
                return (fieldValues as IValue[]).map((v, i) => _renderInput(!i && fieldLabel, v.id_value, v.value, i));
            } else {
                const valToDisplay = !!fieldValues
                    ? attr.id === 'id'
                        ? (fieldValues as IValue)
                        : (fieldValues as IValue).value
                    : '';
                const idValue = !!fieldValues ? (fieldValues as IValue).id_value : null;
                return _renderInput(attributeLabel, idValue, valToDisplay);
            }
        };

        submitRef.current = handleSubmit;

        return (
            <Form onSubmit={handleSubmit}>
                {attributes.map(a => (
                    <FormFieldWrapper key={a.id} error={(errors[a.id] && errors[a.id].message) || ''}>
                        {_renderValueField(a, values[a.id], _isAttributeReadOnly(a))}
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

    return <Formik render={_renderForm} initialValues={recordData} onSubmit={onSave} enableReinitialize />;
}

export default withNamespaces()(EditRecordForm);
