import {localizedTranslation} from '@leav/utils';
import useLang from '../../../../hooks/useLang';
import {Form, type FormDropdownProps} from 'semantic-ui-react';
import {type GET_VERSION_PROFILES_versionProfiles_list} from '../../../../_gqlTypes/GET_VERSION_PROFILES';

interface IVersionProfilesSelectorFieldProps extends FormDropdownProps {
    profiles: GET_VERSION_PROFILES_versionProfiles_list[];
}

function VersionProfilesSelectorField({profiles, ...fieldProps}: IVersionProfilesSelectorFieldProps): JSX.Element {
    const {lang} = useLang();
    const options = profiles.map(l => ({key: l.id, value: l.id, text: localizedTranslation(l.label, lang)}));

    if (fieldProps.clearable) {
        options.unshift({key: '', value: '', text: ''});
    }

    return <Form.Dropdown {...{...fieldProps, clearable: undefined}} search options={options} />;
}

export default VersionProfilesSelectorField;
