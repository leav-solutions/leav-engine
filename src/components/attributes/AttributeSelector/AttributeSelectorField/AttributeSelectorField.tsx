import React from 'react';
import {DropdownProps, Form} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils';
import {GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';

interface IAttributeSelectorFieldProps extends DropdownProps {
    attributes: GET_ATTRIBUTES_attributes_list[];
}

function AttributeSelectorField({attributes = [], ...fieldProps}: IAttributeSelectorFieldProps): JSX.Element {
    const availableLanguages = useLang().lang;
    const options = attributes.map(l => ({key: l.id, value: l.id, text: localizedLabel(l.label, availableLanguages)}));

    return <Form.Dropdown {...fieldProps} search options={options} />;
}

export default AttributeSelectorField;
