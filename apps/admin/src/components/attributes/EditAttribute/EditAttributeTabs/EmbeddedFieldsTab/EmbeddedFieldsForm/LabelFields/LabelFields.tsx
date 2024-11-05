// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import React from 'react';
import {Form, InputOnChangeData} from 'semantic-ui-react';
import {AvailableLanguage} from '../../../../../../../_gqlTypes/globalTypes';
import {ILabel} from '../../../../../../../_types/embeddedFields';
import {IFormValues} from '../EmbeddedFieldsForm';

interface ILabelFieldsProps {
    formValues: IFormValues;
    setFormValues: React.Dispatch<React.SetStateAction<IFormValues>>;
    onChange: (label: ILabel) => void;
    t: TFunction;
    save: (form: IFormValues) => void;
}

function LabelFields({formValues, setFormValues, onChange, t, save}: ILabelFieldsProps) {
    const label: ILabel =
        formValues.label ??
        Object.keys(AvailableLanguage as object).reduce((acc, labelIndex) => ({...acc, [labelIndex]: ''}), {});

    const fields = Object.keys(AvailableLanguage).map(labelIndex => {
        const handleOnChangeLabel = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            const newLabel = {
                ...label,
                [labelIndex]: data.value.toString() ?? ''
            };

            setFormValues(v => ({
                ...v,
                label: newLabel
            }));

            onChange(newLabel);
        };

        const _save = () => {
            save(formValues);
        };

        return (
            <Form.Input
                name={`label-${labelIndex}`}
                label={`${t('attributes.label')} ${labelIndex}`}
                key={labelIndex}
                value={label[labelIndex]}
                onChange={handleOnChangeLabel}
                onBlur={_save}
            />
        );
    });

    return <Form.Group>{fields}</Form.Group>;
}

export default LabelFields;
