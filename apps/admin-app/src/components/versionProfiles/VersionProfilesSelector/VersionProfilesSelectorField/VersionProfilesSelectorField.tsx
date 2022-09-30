// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import useLang from 'hooks/useLang';
import React from 'react';
import {Form, FormDropdownProps} from 'semantic-ui-react';
import {GET_VERSION_PROFILES_versionProfiles_list} from '_gqlTypes/GET_VERSION_PROFILES';

interface IVersionProfilesSelectorFieldProps extends FormDropdownProps {
    profiles: GET_VERSION_PROFILES_versionProfiles_list[];
}

function VersionProfilesSelectorField({profiles, ...fieldProps}: IVersionProfilesSelectorFieldProps): JSX.Element {
    const {lang} = useLang();
    const options = profiles.map(l => ({key: l.id, value: l.id, text: localizedTranslation(l.label, lang)}));

    if (!!fieldProps.clearable) {
        options.unshift({key: '', value: '', text: ''});
    }

    return <Form.Dropdown {...{...fieldProps, clearable: undefined}} search options={options} />;
}

export default VersionProfilesSelectorField;
