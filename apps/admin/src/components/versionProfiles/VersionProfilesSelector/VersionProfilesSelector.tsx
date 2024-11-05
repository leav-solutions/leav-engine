// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getVersionProfilesQuery} from 'queries/versionProfiles/getVersionProfilesQuery';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {GET_VERSION_PROFILES, GET_VERSION_PROFILESVariables} from '_gqlTypes/GET_VERSION_PROFILES';
import VersionProfilesSelectorField from './VersionProfilesSelectorField';

function VersionProfilesSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, error: queryError, data} = useQuery<GET_VERSION_PROFILES, GET_VERSION_PROFILESVariables>(
        getVersionProfilesQuery
    );

    if (queryError) {
        return <ErrorDisplay message={queryError.message} />;
    }

    const profiles = data?.versionProfiles?.list || [];

    return <VersionProfilesSelectorField {...fieldProps} loading={loading} profiles={profiles} />;
}

export default VersionProfilesSelector;
