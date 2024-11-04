// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '_gqlTypes/GET_LIBRARIES';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import LibrariesSelectorField from '../LibrariesSelectorField';

function LibrariesSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery);

    return (
        <LibrariesSelectorField
            {...fieldProps}
            loading={loading}
            libraries={!!data && data.libraries ? data.libraries.list : null}
        />
    );
}

export default LibrariesSelector;
