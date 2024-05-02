// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Form, InputOnChangeData} from 'semantic-ui-react';
import {AttributeFormat} from '../../../../../../_gqlTypes/globalTypes';
import {IEmbeddedFields, ILabel} from '../../../../../../_types/embeddedFields';
import {IFormValue} from '../EmbeddedFieldsTab';
import LabelFields from './LabelFields';
import SelectFormat from './SelectFormat';

interface IEmbeddedFieldsFormProps {
    attribute: IEmbeddedFields;
    formValues: IFormValue[];
    setFormValues: React.Dispatch<React.SetStateAction<IFormValue[]>>;
    save: (newValues: IFormValue[]) => void;
    isRoot?: boolean;
}

export interface IFormValues {
    originalId: string;
    id: string;
    label: ILabel | null;
    format: string;
    validation_regex?: string | null;
}

function EmbeddedFieldsForm({
    attribute: {id, label, format, validation_regex, embedded_fields},
    formValues: values,
    setFormValues: setValues,
    save,
    isRoot
}: IEmbeddedFieldsFormProps) {
    const {t} = useTranslation();
    const [formValues, setFormValues] = useState<IFormValues>({
        originalId: id,
        id,
        label,
        format,
        validation_regex
    });

    const _handleId = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        const newId = data.value?.toString() ?? '';
        setFormValues(v => ({...v, id: newId}));
        _updateValues({...formValues, id: newId});
    };

    const _handleSelect = (newFormat: string) => {
        setFormValues(v => ({...v, format: newFormat}));
        _updateValues({...formValues, format: newFormat});
    };

    const _handleOnChangeValidationRegex = async (
        event: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData
    ) => {
        const newValidationRegex = data.value?.toString() ?? '';
        setFormValues(v => ({...v, validation_regex: newValidationRegex}));

        _updateValues({...formValues, validation_regex: newValidationRegex});
    };

    const _handleOnChangeLabel = (newLabel: ILabel) => {
        _updateValues({...formValues, label: newLabel});
    };

    const _updateValues = (form: IFormValues) => {
        const newValues = _getNewValues(form);
        setValues(newValues);
    };

    const _save = (form: IFormValues) => {
        const newValues = _getNewValues(form);
        save(newValues);
    };

    const _getNewValues = (form: IFormValues) => {
        const valueFind = values.find(value => value.originalId === id);

        const newValues = valueFind ? values.map(v => (v.originalId === id ? form : v)) : [...values, form];

        return newValues;
    };

    const _handleBlur = () => {
        _save(formValues);
    };

    const formatRegexValidation: string[] = [AttributeFormat.text, AttributeFormat.numeric, AttributeFormat.encrypted];

    return (
        <div className="ui fluid" style={{padding: '1rem'}}>
            <Form>
                <Form.Input
                    label={t('attributes.ID')}
                    disabled={isRoot}
                    name="id"
                    value={formValues.id}
                    onChange={_handleId}
                    onBlur={_handleBlur}
                />

                <LabelFields
                    t={t}
                    formValues={formValues}
                    setFormValues={setFormValues}
                    onChange={_handleOnChangeLabel}
                    save={_handleBlur}
                />

                <Form.Group>
                    <SelectFormat
                        formValues={formValues}
                        hasChild={!!embedded_fields}
                        onChange={_handleSelect}
                        t={t}
                        save={_save}
                    />

                    {formatRegexValidation.includes(formValues.format) && (
                        <Form.Input
                            label={t('attributes.validation_regex')}
                            value={formValues.validation_regex ?? ''}
                            name="validation_regex"
                            onChange={_handleOnChangeValidationRegex}
                            onBlur={_handleBlur}
                        />
                    )}
                </Form.Group>
            </Form>
        </div>
    );
}

export default EmbeddedFieldsForm;
