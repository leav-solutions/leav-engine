// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Form, Label} from 'semantic-ui-react';

export interface IFormFieldWrapperProps {
    error?: string;
    children: React.ReactNode;
}

function FormFieldWrapper({error, children}: IFormFieldWrapperProps): JSX.Element {
    const childrenList: React.ReactNode[] = children ? (!Array.isArray(children) ? [children] : children) : [];

    return (
        <Form.Field>
            {childrenList.map((c, i) => React.cloneElement(c as React.ReactElement<any>, {error: !!error, key: i}))}
            {!!error && <Label pointing="above">{typeof error !== 'string' ? JSON.stringify(error) : error}</Label>}
        </Form.Field>
    );
}

export default FormFieldWrapper;
