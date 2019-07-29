import React from 'react';
import {FormDropdownProps} from 'semantic-ui-react';
import {getLibsQuery, LibrariesQuery} from '../../../queries/libraries/getLibrariesQuery';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';
import LibrariesSelectorField from '../LibrariesSelectorField';

interface ILibrariesSelectorProps extends FormDropdownProps {
    lang: AvailableLanguage[];
}

function LibrariesSelector({lang, ...fieldProps}: ILibrariesSelectorProps): JSX.Element {
    return (
        <LibrariesQuery query={getLibsQuery} variables={{lang}}>
            {({loading, error, data}) => (
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
