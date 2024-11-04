// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLang from 'hooks/useLang';
import React from 'react';
import {Form, FormDropdownProps} from 'semantic-ui-react';
import {localizedLabel} from 'utils';
import {GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list} from '_gqlTypes/GET_LIBRARIES_WITH_ATTRIBUTES';

interface IAttributeLibrariesFieldProps extends FormDropdownProps {
    libraries: GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list[];
}

function AttributeLibrariesField({libraries, ...fieldProps}: IAttributeLibrariesFieldProps): JSX.Element {
    const availableLanguages = useLang().lang;
    const options = !!libraries
        ? libraries.map(l => ({key: l.id, value: l.id, text: localizedLabel(l.label, availableLanguages)}))
        : [];

    return <Form.Dropdown {...fieldProps} aria-label="linked-libraries" search options={options} />;
}

export default AttributeLibrariesField;
