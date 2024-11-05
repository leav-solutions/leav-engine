// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TFunction} from 'i18next';
import React, {useState} from 'react';
import {Confirm, DropdownProps, Form} from 'semantic-ui-react';
import {AttributeFormat} from '../../../../../../../_gqlTypes/globalTypes';
import {IFormValues} from '../EmbeddedFieldsForm';

interface ISelectFormatProps {
    formValues: IFormValues;
    hasChild: boolean;
    onChange: (newFormat: string) => void;
    t: TFunction;
    save: (form: IFormValues) => void;
}

function SelectFormat({formValues, hasChild, onChange, t, save}: ISelectFormatProps) {
    const [show, setShow] = useState<boolean>(false);
    const [format, setFormat] = useState<string>(formValues.format);

    const _onChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newFormat = data.value?.toString() ?? '';
        setFormat(newFormat);

        if (format === AttributeFormat.extended && data.value !== AttributeFormat.extended && hasChild) {
            setShow(true);
        } else {
            onChange(newFormat);
            save({...formValues, format: newFormat});
        }
    };

    const _cancel = () => {
        setShow(false);
    };

    const _confirm = () => {
        onChange(format);
        save({...formValues, format});
        setShow(false);
    };

    return (
        <>
            <Form.Select
                label={t('attributes.format')}
                name="format"
                options={Object.keys(AttributeFormat).map(f => ({
                    text: t('attributes.formats.' + f),
                    value: f
                }))}
                value={formValues.format}
                onChange={_onChange}
            />
            <Confirm
                open={show}
                content="Are you sure ? You will lost the child"
                onCancel={_cancel}
                onConfirm={_confirm}
            />
        </>
    );
}

export default SelectFormat;
