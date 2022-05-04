// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getApplicationComponentsQuery} from 'queries/applications/getApplicationsComponentsQuery';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {GET_APPLICATION_COMPONENTS} from '_gqlTypes/GET_APPLICATION_COMPONENTS';
import ComponentSelectorField from './ComponentSelectorField';

function ComponentSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, data} = useQuery<GET_APPLICATION_COMPONENTS>(getApplicationComponentsQuery);

    return (
        <ComponentSelectorField
            {...fieldProps}
            aria-label="select-component"
            loading={loading}
            components={data?.applicationsComponents ?? []}
        />
    );
}

export default ComponentSelector;
