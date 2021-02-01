// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {getLibsQuery, LibrariesQuery} from '../../../queries/libraries/getLibrariesQuery';
import LibrariesSelectorField from '../LibrariesSelectorField';

function LibrariesSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {lang} = useLang();

    return (
        <LibrariesQuery query={getLibsQuery} variables={{lang}}>
            {({loading, data}) => (
                <LibrariesSelectorField
                    {...fieldProps}
                    loading={loading}
                    libraries={!!data && data.libraries ? data.libraries.list : null}
                />
            )}
        </LibrariesQuery>
    );
}

export default LibrariesSelector;
