// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import EmbeddedFieldsDisplay from '../EmbeddedFieldsDisplay';
import EmbeddedFieldsForm from '../EmbeddedFieldsForm';
import {IFormValue} from '../EmbeddedFieldsTab';

interface IEmbeddedFieldsWrapperProps {
    attribute: any;
    displayForm: boolean;
    formValues: IFormValue[];
    setFormValues: React.Dispatch<React.SetStateAction<IFormValue[]>>;
    isRoot?: boolean;
    save: (newValues: IFormValue[]) => void;
}

function EmbeddedFieldsWrapper({
    attribute,
    displayForm,
    formValues,
    setFormValues,
    isRoot,
    save
}: IEmbeddedFieldsWrapperProps) {
    if (displayForm) {
        return (
            <EmbeddedFieldsForm
                attribute={attribute}
                formValues={formValues}
                setFormValues={setFormValues}
                isRoot={isRoot}
                save={save}
            />
        );
    }
    return <EmbeddedFieldsDisplay attribute={attribute} />;
}

export default EmbeddedFieldsWrapper;
