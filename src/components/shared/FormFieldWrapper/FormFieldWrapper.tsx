import * as React from 'react';
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
            {!!error && <Label pointing="above">{error}</Label>}
        </Form.Field>
    );
}

export default FormFieldWrapper;
