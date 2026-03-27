// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetApplicationModulesQuery} from '../../../../../../../_gqlTypes';
import {type FormDropdownProps} from 'semantic-ui-react';
import ModuleSelectorField from './ModuleSelectorField';
import {type GET_APPLICATION_COMPONENTS_applicationsComponents} from '../../../../../../../_gqlTypes/GET_APPLICATION_COMPONENTS';

function ModuleSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, data} = useGetApplicationModulesQuery();

    return (
        <ModuleSelectorField
            {...fieldProps}
            aria-label="select-module"
            loading={loading}
            modules={(data?.applicationsModules as GET_APPLICATION_COMPONENTS_applicationsComponents[]) ?? []}
        />
    );
}

export default ModuleSelector;
