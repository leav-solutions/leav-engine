// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FormDropdownProps} from 'semantic-ui-react';
import {type GET_LIBRARIES_libraries_list} from '_gqlTypes/GET_LIBRARIES';
import LibrariesSelectorField from '../LibrariesSelectorField';
import {useGetLibrariesQuery} from '_gqlTypes';

function LibrariesSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, data} = useGetLibrariesQuery();

    return (
        <LibrariesSelectorField
            {...fieldProps}
            loading={loading}
            libraries={!!data && data.libraries ? (data.libraries.list as GET_LIBRARIES_libraries_list[]) : null}
        />
    );
}

export default LibrariesSelector;
