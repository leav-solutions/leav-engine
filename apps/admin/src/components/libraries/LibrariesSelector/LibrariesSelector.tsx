import {type FormDropdownProps} from 'semantic-ui-react';
import {type GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import LibrariesSelectorField from '../LibrariesSelectorField';
import {useGetLibrariesQuery} from '../../../_gqlTypes';

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
