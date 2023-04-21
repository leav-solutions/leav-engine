// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getApplicationModulesQuery} from 'queries/applications/getApplicationsModulesQuery';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {GET_APPLICATION_MODULES} from '_gqlTypes/GET_APPLICATION_MODULES';
import ModuleSelectorField from './ModuleSelectorField';

function ModuleSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, data} = useQuery<GET_APPLICATION_MODULES>(getApplicationModulesQuery);

    return (
        <ModuleSelectorField
            {...fieldProps}
            aria-label="select-module"
            loading={loading}
            modules={data?.applicationsModules ?? []}
        />
    );
}

export default ModuleSelector;
