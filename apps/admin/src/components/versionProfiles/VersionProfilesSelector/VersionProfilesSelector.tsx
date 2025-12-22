// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {type FormDropdownProps} from 'semantic-ui-react';
import VersionProfilesSelectorField from './VersionProfilesSelectorField';
import {useGetVersionProfilesQuery} from '_gqlTypes';

function VersionProfilesSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, error: queryError, data} = useGetVersionProfilesQuery();

    if (queryError) {
        return <ErrorDisplay message={queryError.message} />;
    }

    const profiles = data?.versionProfiles?.list || [];

    return <VersionProfilesSelectorField {...fieldProps} loading={loading} profiles={profiles} />;
}

export default VersionProfilesSelector;
