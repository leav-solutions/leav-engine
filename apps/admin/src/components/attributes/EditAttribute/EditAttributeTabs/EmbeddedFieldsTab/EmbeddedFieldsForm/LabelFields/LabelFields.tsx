import {type TFunction} from 'i18next';
import {type ChangeEvent, type Dispatch, type SetStateAction} from 'react';
import {Form, type InputOnChangeData} from 'semantic-ui-react';
import {AvailableLanguage} from '../../../../../../../_gqlTypes';
import {type ILabel} from '../../../../../../../_types/embeddedFields';
import {type IFormValues} from '../EmbeddedFieldsForm';

interface ILabelFieldsProps {
    formValues: IFormValues;
    setFormValues: Dispatch<SetStateAction<IFormValues>>;
    onChange: (label: ILabel) => void;
    t: TFunction;
    save: (form: IFormValues) => void;
}

function LabelFields({formValues, setFormValues, onChange, t, save}: ILabelFieldsProps) {
    const label: ILabel =
        formValues.label ??
        Object.keys(AvailableLanguage as object).reduce((acc, labelIndex) => ({...acc, [labelIndex]: ''}), {});

    const fields = Object.keys(AvailableLanguage).map(labelIndex => {
        const handleOnChangeLabel = (event: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
            const newLabel = {
                ...label,
                [labelIndex]: data.value.toString() ?? '',
            };

            setFormValues(v => ({
                ...v,
                label: newLabel,
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
