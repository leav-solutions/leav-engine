// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Dropdown, DropdownProps, Form, Header} from 'semantic-ui-react';
import {GET_APPLICATION_COMPONENTS_applicationsComponents} from '_gqlTypes/GET_APPLICATION_COMPONENTS';

interface IModuleSelectorFieldProps extends DropdownProps {
    modules: GET_APPLICATION_COMPONENTS_applicationsComponents[];
}

const ModuleSelectorField = ({modules, ...fieldProps}: IModuleSelectorFieldProps): JSX.Element => {
    const options = (modules ?? []).map(comp => ({
        key: comp.id,
        value: comp.id,
        text: comp.id,
        content: <Header size="small" content={comp.id} subheader={comp.description} />
    }));

    return (
        <Form.Dropdown
            {...fieldProps}
            search
            options={options}
            // To avoid some formik warnings because the name property is not defined in the Form.Dropdown default input
            searchInput={<Dropdown.SearchInput name={fieldProps.name ?? 'component'} />}
        />
    );
};

export default ModuleSelectorField;
